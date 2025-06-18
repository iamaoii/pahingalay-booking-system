from flask import Blueprint, jsonify, request, current_app
from models import db, GuestInformation
import logging
import jwt

logger = logging.getLogger(__name__)

guests_bp = Blueprint('guests', __name__, url_prefix='/api')

@guests_bp.route('/guest-info', methods=['GET'])
def get_guest_info():
    """Retrieve guest information for the logged-in user."""
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

@guests_bp.route('/guest-profile', methods=['GET'])
def get_guest_profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("No valid Authorization header provided")
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        token = auth_header.split(' ')[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        guest_id = decoded['user_id']
        logger.debug(f"Decoded guest_id: {guest_id}")
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return jsonify({'error': 'Session expired, please sign in again'}), 401
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return jsonify({'error': 'Invalid authentication token'}), 401

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
        logger.warning("No data provided in profile update request")
        return jsonify({'error': 'No data provided for profile update'}), 400

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
        return jsonify({'error': 'Failed to update profile due to a server error'}), 500