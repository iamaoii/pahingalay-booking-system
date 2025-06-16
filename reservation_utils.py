from models import ReservationInformation

def generate_reservation_no():
    """
    Generate a unique reservation number in the format 'R-00000101'.
    Starts with 'R-' followed by an 8-character alphanumeric string, auto-incremented.
    """
    last_reservation = ReservationInformation.query.order_by(ReservationInformation.reservationNo.desc()).first()
    if not last_reservation:
        return 'R-00000001'
    last_no = last_reservation.reservationNo[2:]  # Remove 'R-'
    try:
        num = int(last_no, 36)  # Convert alphanumeric to integer (base-36)
        next_num = num + 1
        next_no = format(next_num, '08X').zfill(8)  # Convert to 8-char alphanumeric
        return f'R-{next_no}'
    except ValueError:
        return 'R-00000001'