from models import ReservationInformation, CompanionInformation
from datetime import datetime

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