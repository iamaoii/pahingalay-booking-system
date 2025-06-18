from flask import Blueprint, jsonify, request, current_app
from models import db, ReservationInformation, CompanionInformation
from datetime import datetime
import logging
import jwt
from id_utils import generate_reservation_number, generate_companion_id

logger = logging.getLogger(__name__)

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api')

@bookings_bp.route('/booking', methods=['POST'])
def create_booking():
    """Create a new booking and store it in the database."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid token'}), 401

    data = request.get_json()
    if not data:
        logger.warning("No data provided in booking request")
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['checkInDate', 'checkOutDate', 'noOfNight', 'noOfAdults', 'noOfChildren', 
                      'roomType', 'bedType', 'smokingPref']
    for field in required_fields:
        if field not in data:
            logger.warning(f"Missing required field: {field}")
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        check_in = datetime.strptime(data['checkInDate'], '%Y-%m-%d').date()
        check_out = datetime.strptime(data['checkOutDate'], '%Y-%m-%d').date()
    except ValueError:
        logger.warning("Invalid date format")
        return jsonify({'error': 'Invalid date format'}), 400

    if check_out <= check_in:
        logger.warning("Check-out date must be after check-in date")
        return jsonify({'error': 'Check-out date must be after check-in date'}), 400

    # Calculate total price based on room type and number of nights
    prices = {
        'single': 999,
        'double': 1499,
        'suite': 2499,
        'family': 3499
    }
    total_price = prices.get(data['roomType'], 1499) * data['noOfNight']

    # Generate reservation number
    reservation_no = generate_reservation_number()

    # Create reservation
    reservation = ReservationInformation(
        reservationNo=reservation_no,
        guestID=guest_id,
        checkInDate=check_in,
        checkOutDate=check_out,
        noOfNight=data['noOfNight'],
        noOfAdults=data['noOfAdults'],
        noOfChildren=data['noOfChildren'],
        roomType=data['roomType'],
        bedType=data['bedType'],
        smokingPref=data['smokingPref'],
        additionalRequest=data.get('additionalRequest', 'None'),
        totalAmount=total_price
    )
    db.session.add(reservation)
    db.session.flush()  # Get reservation ID before committing

    # Handle companions
    companions = data.get('companions', [])
    if len(companions) > 5:
        logger.warning("Too many companions provided")
        return jsonify({'error': 'Maximum of 5 companions allowed'}), 400

    for i, companion in enumerate(companions, 1):
        required_comp_fields = ['compName', 'compContactNo', 'compEmail', 'compAge', 'compSex']
        if not all(field in companion for field in required_comp_fields):
            logger.warning("Missing companion fields")
            return jsonify({'error': 'Missing companion fields'}), 400

        companion_id = generate_companion_id(check_in, i)
        companion_record = CompanionInformation(
            reservationNo=reservation_no,
            companionID=companion_id,
            compName=companion['compName'],
            compContactNo=companion['compContactNo'],
            compEmail=companion['compEmail'],
            compAge=companion['compAge'],
            compSex=companion['compSex']
        )
        db.session.add(companion_record)

    try:
        db.session.commit()
        logger.info(f"Booking created successfully: {reservation_no}")
        return jsonify({
            'message': 'Booking created successfully',
            'reservationNo': reservation_no
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to create booking: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500