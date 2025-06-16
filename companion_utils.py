from models import CompanionInformation

def generate_companion_id(check_in_date, reservation_no):
    """
    Generate a unique companion ID in the format 'C-MMDDYYYY-NNNN'.
    Starts with 'C-', followed by check-in date (MMDDYYYY) and a 4-digit auto-incremented number.
    """
    date_str = check_in_date.strftime('%m%d%Y')
    last_companion = CompanionInformation.query.filter(
        CompanionInformation.reservationNo == reservation_no
    ).order_by(CompanionInformation.companionID.desc()).first()
    if not last_companion:
        return f'C-{date_str}-1001'
    last_id = last_companion.companionID
    last_num = int(last_id.split('-')[-1])
    next_num = last_num + 1
    return f'C-{date_str}-{next_num:04d}'