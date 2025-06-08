from flask import Blueprint, jsonify, request, current_app
from models import db, GuestInformation
from flask_bcrypt import Bcrypt
import jwt
import datetime
import logging
from sqlalchemy import func

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api')
bcrypt = Bcrypt()

def generate_guest_id():
    """Generate a guestID in the format G-XXXXXXX."""
    # Get the latest guestID
    last_guest = GuestInformation.query.order_by(func.cast(func.substr(GuestInformation.guestID, 3), db.Integer).desc()).first()
    if last_guest:
        # Extract the numeric part (e.g., '00002841' from 'G-00002841')
        last_number = int(last_guest.guestID[2:])  # Skip 'G-'
        next_number = last_number + 1
    else:
        next_number = 1  # Start at 1 if no guests exist
    # Format as G-XXXXXXX (7 digits)
    return f"G-{next_number:08d}"

@auth_bp.route('/check-email', methods=['POST'])
def check_email():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'exists': False}), 400

    guest = GuestInformation.query.filter_by(guestEmail=email).first()
    return jsonify({'exists': bool(guest)}), 200

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    remember = data.get('remember', False)

    if not email or not password:
        return jsonify(), 400

    guest = GuestInformation.query.filter_by(guestEmail=email).first()

    if guest and bcrypt.check_password_hash(guest.password, password):
        token = jwt.encode({
            'user_id': guest.guestID,
            'email': guest.guestEmail,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1 if remember else 1/24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'token': token,
            'user': {
                'id': guest.guestID,
                'email': guest.guestEmail,
                'name': guest.guestName
            }
        }), 200
    else:
        return jsonify(), 401

@auth_bp.route('/signup', methods=['POST'])
def signup():
    logger.debug("Received signup request")
    data = request.get_json()

    required_fields = ['fullName', 'email', 'password', 'confirmPassword', 'contact', 'age', 'nationality', 'address', 'sex']
    for field in required_fields:
        if not data.get(field):
            logger.warning(f"Missing field: {field}")
            return jsonify(), 400

    email = data.get('email')
    if not email or '@' not in email or '.' not in email:
        logger.warning("Invalid email format")
        return jsonify(), 400

    if GuestInformation.query.filter_by(guestEmail=email).first():
        logger.warning(f"Email already registered: {email}")
        return jsonify(), 400

    if data.get('password') != data.get('confirmPassword'):
        logger.warning("Passwords do not match")
        return jsonify(), 400

    if len(data.get('password')) < 8:
        logger.warning("Password too short")
        return jsonify(), 400

    try:
        age = int(data.get('age'))
        if age < 18 or age > 120:
            logger.warning(f"Invalid age: {age}")
            return jsonify(), 400
    except ValueError:
        logger.warning("Invalid age format")
        return jsonify(), 400

    hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')

    # Generate unique guestID
    guest_id = generate_guest_id()

    new_guest = GuestInformation(
        guestID=guest_id,
        guestName=data.get('fullName'),
        guestEmail=email,
        password=hashed_password,
        guestContactNo=data.get('contact'),
        guestSex=data.get('sex'),
        guestAge=age,
        nationality=data.get('nationality'),
        address=data.get('address')
    )

    try:
        db.session.add(new_guest)
        db.session.commit()
        logger.info(f"New guest created: {email}, guestID: {guest_id}")

        token = jwt.encode({
            'user_id': new_guest.guestID,
            'email': new_guest.guestEmail,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'token': token,
            'user': {
                'id': new_guest.guestID,
                'email': new_guest.guestEmail,
                'name': new_guest.guestName
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to create account: {str(e)}")
        return jsonify(), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    logger.debug("Logout request received")
    return jsonify(), 200