from flask import Blueprint, jsonify
from models import GuestInformation

guests_bp = Blueprint('guests', __name__, url_prefix='/api')

@guests_bp.route('/guests', methods=['GET'])
def get_guests():
    guests = GuestInformation.query.all()
    return jsonify([{
        'guestID': guest.guestID,  # Now a string like G-0000001
        'guestName': guest.guestName,
        'guestEmail': guest.guestEmail,
        'guestContactNo': guest.guestContactNo,
        'guestSex': guest.guestSex,
        'guestAge': guest.guestAge,
        'nationality': guest.nationality,
        'address': guest.address
    } for guest in guests]), 200