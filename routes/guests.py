from flask import Blueprint, jsonify, request, current_app
from models import db, GuestInformation, ReservationInformation, CompanionInformation
from datetime import datetime
import logging
import jwt

logger = logging.getLogger(__name__)

guests_bp = Blueprint('guests', __name__, url_prefix='/api')

def generate_reservation_number():
    """Generate a reservation number in the format R-00000101."""
    last_reservation = ReservationInformation.query.order_by(
        ReservationInformation.reservationNo.desc()
    ).first()
    if last_reservation:
        last_number = int(last_reservation.reservationNo[2:])  # Remove 'R-' and convert to int
        new_number = last_number + 1
    else:
        new_number = 1
    return f"R-{new_number:08d}"

def generate_companion_id(check_in_date, count):
    """Generate a companion ID in the format C-MMDDYYYY-NNNN."""
    date_str = check_in_date.strftime('%m%d%Y')
    return f"C-{date_str}-{count:04d}"

@guests_bp.route('/guest-info', methods=['GET'])
def get_guest_info():
    """Retrieve guest information for the logged-in user."""
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

    guest = GuestInformation.query.filter_by(guestID=guest_id).first()
    if not guest:
        logger.warning(f"Guest not found: {guest_id}")
        return jsonify({'error': 'Guest not found'}), 404

    logger.info(f"Retrieved guest info for guestID: {guest_id}")
    return jsonify({
        'guestID': guest.guestID,
        'guestName': guest.guestName,
        'guestEmail': guest.guestEmail,
        'guestContactNo': guest.guestContactNo,
        'guestSex': guest.guestSex,
        'guestAge': guest.guestAge,
        'nationality': guest.nationality,
        'address': guest.address
    }), 200

@guests_bp.route('/booking', methods=['POST'])
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
        additionalRequest=data.get('additionalRequest', 'None')
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

@guests_bp.route('/guest-profile', methods=['GET'])
def get_guest_profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
        logger.debug(f"Decoded guest_id: {guest_id}")  # Debug log
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid token'}), 401

    guest = GuestInformation.query.filter_by(guestID=guest_id).first()
    if not guest:
        logger.warning(f"Guest not found: {guest_id}")
        return jsonify({'error': 'Guest not found'}), 404

    logger.info(f"Retrieved guest profile for guestID: {guest_id}")
    return jsonify({
        'guestID': guest.guestID,
        'guestName': guest.guestName,
        'guestEmail': guest.guestEmail,
        'guestContactNo': guest.guestContactNo,
        'guestSex': guest.guestSex,
        'guestAge': guest.guestAge,
        'nationality': guest.nationality,
        'address': guest.address
    }), 200

@guests_bp.route('/update-guest-profile', methods=['POST'])
def update_guest_profile():
    """Update guest profile for the logged-in user."""
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
        logger.warning("No data provided in profile update request")
        return jsonify({'error': 'No data provided'}), 400

    guest = GuestInformation.query.filter_by(guestID=guest_id).first()
    if not guest:
        logger.warning(f"Guest not found: {guest_id}")
        return jsonify({'error': 'Guest not found'}), 404

    try:
        guest.guestName = data.get('guestName', guest.guestName)
        guest.guestEmail = data.get('guestEmail', guest.guestEmail)
        guest.guestContactNo = data.get('guestContactNo', guest.guestContactNo)
        guest.guestAge = int(data.get('guestAge', guest.guestAge))
        guest.nationality = data.get('nationality', guest.nationality)
        guest.address = data.get('address', guest.address)
        guest.guestSex = data.get('guestSex', guest.guestSex)

        if guest.guestAge < 18 or guest.guestAge > 120:
            logger.warning(f"Invalid age: {guest.guestAge}")
            return jsonify({'error': 'Age must be between 18 and 120'}), 400

        db.session.commit()
        logger.info(f"Updated guest profile for guestID: {guest_id}")
        return jsonify({'message': 'Profile updated successfully'}), 200
    except ValueError:
        logger.error("Invalid age format")
        db.session.rollback()
        return jsonify({'error': 'Invalid age format'}), 400
    except Exception as e:
        logger.error(f"Failed to update profile: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500