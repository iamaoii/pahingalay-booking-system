from flask import Blueprint, jsonify, request, current_app
from models import db, ReservationInformation, CompanionInformation, RoomPrice
from datetime import datetime
import logging
import jwt
from id_utils import generate_reservation_number, generate_companion_id

logger = logging.getLogger(__name__)

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api')

def check_room_availability(room_type, check_in, check_out):
    """Check if a room of the given type is available for the specified dates."""
    MAX_ROOMS_PER_TYPE = 10  # Example: 10 rooms per type
    overlapping_reservations = ReservationInformation.query.filter(
        ReservationInformation.roomType == room_type,
        ReservationInformation.checkInDate <= check_out,
        ReservationInformation.checkOutDate >= check_in
    ).count()
    return overlapping_reservations < MAX_ROOMS_PER_TYPE

@bookings_bp.route('/room-prices', methods=['GET'])
def get_room_prices():
    """Retrieve room prices."""
    prices = {room.roomType: room.price for room in RoomPrice.query.all()}
    return jsonify(prices), 200

@bookings_bp.route('/booking', methods=['POST'])
def create_booking():
    """Create a new booking and store it in the database."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Session expired, please sign in again'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid authentication token'}), 401

    data = request.get_json()
    if not data:
        logger.warning("No data provided in booking request")
        return jsonify({'error': 'No data provided for booking'}), 400

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
        return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

    if check_out <= check_in:
        logger.warning("Check-out date must be after check-in date")
        return jsonify({'error': 'Check-out date must be after check-in date'}), 400

    if not check_room_availability(data['roomType'], check_in, check_out):
        logger.warning(f"No available {data['roomType']} rooms for the selected dates")
        return jsonify({'error': f'No available {data["roomType"]} rooms for the selected dates'}), 400

    room_price = RoomPrice.query.filter_by(roomType=data['roomType']).first()
    total_price = room_price.price * data['noOfNight'] if room_price else 1499 * data['noOfNight']

    reservation_no = generate_reservation_number()

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
        additionalReq=data.get('additionalReq', 'None'),
        totalAmount=total_price
    )
    db.session.add(reservation)
    db.session.flush()

    companions = data.get('companions', [])
    if len(companions) > 5:
        logger.warning("Too many companions provided")
        return jsonify({'error': 'Maximum of 5 companions allowed'}), 400

    for i, companion in enumerate(companions, 1):
        required_comp_fields = ['compName', 'compContactNo', 'compEmail', 'compAge', 'compSex']
        if not all(field in companion for field in required_comp_fields):
            logger.warning("Missing companion fields")
            return jsonify({'error': 'Missing required companion fields'}), 400

        if not (0 <= companion['compAge'] <= 120):
            logger.warning(f"Invalid companion age: {companion['compAge']}")
            return jsonify({'error': 'Companion age must be between 0 and 120'}), 400

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
        return jsonify({'error': 'Failed to create booking due to a server error'}), 500
    
@bookings_bp.route('/bookings', methods=['GET'])
def get_bookings():
    """Retrieve all bookings for the logged-in user."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Session expired, please sign in again'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid authentication token'}), 401

    bookings = ReservationInformation.query.filter_by(guestID=guest_id).all()
    booking_list = [{
        'reservationNo': booking.reservationNo,
        'roomType': booking.roomType,
        'checkInDate': booking.checkInDate.strftime('%Y-%m-%d'),
        'checkOutDate': booking.checkOutDate.strftime('%Y-%m-%d'),
        'noOfNight': booking.noOfNight,
        'noOfAdults': booking.noOfAdults,
        'noOfChildren': booking.noOfChildren,
        'totalAmount': float(booking.totalAmount),
        'status': 'Confirmed' if booking.checkInDate > datetime.now().date() else 'Completed'
    } for booking in bookings]

    logger.info(f"Retrieved {len(booking_list)} bookings for guestID: {guest_id}")
    return jsonify(booking_list), 200

@bookings_bp.route('/booking/<reservation_no>', methods=['GET'])
def get_booking(reservation_no):
    """Retrieve a single booking by reservation number."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Session expired, please sign in again'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid authentication token'}), 401

    booking = ReservationInformation.query.filter_by(reservationNo=reservation_no, guestID=guest_id).first()
    if not booking:
        logger.warning(f"Booking not found: {reservation_no}")
        return jsonify({'error': 'Booking not found'}), 404

    companions = CompanionInformation.query.filter_by(reservationNo=reservation_no).all()
    companion_list = [{
        'compName': companion.compName,
        'compContactNo': companion.compContactNo,
        'compEmail': companion.compEmail,
        'compAge': companion.compAge,
        'compSex': companion.compSex
    } for companion in companions]

    booking_data = {
        'reservationNo': booking.reservationNo,
        'roomType': booking.roomType,
        'checkInDate': booking.checkInDate.strftime('%Y-%m-%d'),
        'checkOutDate': booking.checkOutDate.strftime('%Y-%m-%d'),
        'noOfNight': booking.noOfNight,
        'noOfAdults': booking.noOfAdults,
        'noOfChildren': booking.noOfChildren,
        'bedType': booking.bedType,
        'smokingPref': booking.smokingPref,
        'additionalReq': booking.additionalReq,
        'totalAmount': float(booking.totalAmount),
        'status': 'Confirmed' if booking.checkInDate > datetime.now().date() else 'Completed',
        'companions': companion_list
    }

    logger.info(f"Retrieved booking details for reservationNo: {reservation_no}")
    return jsonify(booking_data), 200

@bookings_bp.route('/booking/<reservation_no>', methods=['PUT'])
def update_booking(reservation_no):
    """Update an existing booking."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Session expired, please sign in again'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid authentication token'}), 401

    data = request.get_json()
    if not data:
        logger.warning("No data provided in update request")
        return jsonify({'error': 'No data provided for update'}), 400

    booking = ReservationInformation.query.filter_by(reservationNo=reservation_no, guestID=guest_id).first()
    if not booking:
        logger.warning(f"Booking not found: {reservation_no}")
        return jsonify({'error': 'Booking not found'}), 404

    try:
        check_in = datetime.strptime(data['checkInDate'], '%Y-%m-%d').date()
        check_out = datetime.strptime(data['checkOutDate'], '%Y-%m-%d').date()
    except ValueError:
        logger.warning("Invalid date format")
        return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

    if check_out <= check_in:
        logger.warning("Check-out date must be after check-in date")
        return jsonify({'error': 'Check-out date must be after check-in date'}), 400

    if not check_room_availability(data['roomType'], check_in, check_out):
        logger.warning(f"No available {data['roomType']} rooms for the selected dates")
        return jsonify({'error': f'No available {data["roomType"]} rooms for the selected dates'}), 400

    room_price = RoomPrice.query.filter_by(roomType=data['roomType']).first()
    total_price = room_price.price * data['noOfNight'] if room_price else 1499 * data['noOfNight']

    try:
        booking.checkInDate = check_in
        booking.checkOutDate = check_out
        booking.noOfNight = data['noOfNight']
        booking.noOfAdults = data['noOfAdults']
        booking.noOfChildren = data['noOfChildren']
        booking.roomType = data['roomType']
        booking.bedType = data['bedType']
        booking.smokingPref = data['smokingPref']
        booking.additionalReq = data.get('additionalReq', booking.additionalReq)
        booking.totalAmount = total_price

        # Update companions
        CompanionInformation.query.filter_by(reservationNo=reservation_no).delete()
        for i, companion in enumerate(data.get('companions', []), 1):
            if not all(field in companion for field in ['compName', 'compContactNo', 'compEmail', 'compAge', 'compSex']):
                logger.warning("Missing companion fields")
                return jsonify({'error': 'Missing required companion fields'}), 400

            if not (0 <= companion['compAge'] <= 120):
                logger.warning(f"Invalid companion age: {companion['compAge']}")
                return jsonify({'error': 'Companion age must be between 0 and 120'}), 400

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

        db.session.commit()
        logger.info(f"Booking updated successfully: {reservation_no}")
        return jsonify({'message': 'Booking updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to update booking: {str(e)}")
        return jsonify({'error': 'Failed to update booking due to a server error'}), 500

@bookings_bp.route('/booking/<reservation_no>', methods=['DELETE'])
def delete_booking(reservation_no):
    """Delete a booking and its associated companions."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Session expired, please sign in again'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid authentication token'}), 401

    booking = ReservationInformation.query.filter_by(reservationNo=reservation_no, guestID=guest_id).first()
    if not booking:
        logger.warning(f"Booking not found: {reservation_no}")
        return jsonify({'error': 'Booking not found'}), 404

    try:
        CompanionInformation.query.filter_by(reservationNo=reservation_no).delete()
        db.session.delete(booking)
        db.session.commit()
        logger.info(f"Booking deleted successfully: {reservation_no}")
        return jsonify({'message': 'Booking deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to delete booking: {str(e)}")
        return jsonify({'error': 'Failed to delete booking due to a server error'}), 500