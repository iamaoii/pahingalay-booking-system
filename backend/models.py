from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Models for the database tables
class GuestInformation(db.Model):
    __tablename__ = 'guest_information'

    guestID = db.Column(db.String(10), primary_key=True)
    guestName = db.Column(db.String(60), nullable=False)
    guestEmail = db.Column(db.String(60), nullable=False)
    guestContactNo = db.Column(db.String(13), nullable=False)
    guestSex = db.Column(db.String(1), nullable=False)
    guestAge = db.Column(db.Integer, nullable=False)
    nationality = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(128), nullable=False)

class ReservationInformation(db.Model):
    __tablename__ = 'reservation_information'

    reservationNo = db.Column(db.String(10), primary_key=True)
    guestID = db.Column(db.String(10), db.ForeignKey('guest_information.guestID'), nullable=False)
    checkInDate = db.Column(db.Date, nullable=False)
    checkOutDate = db.Column(db.Date, nullable=False)
    noOfNight = db.Column(db.Integer, nullable=False)
    noOfAdults = db.Column(db.Integer, nullable=False)
    noOfChildren = db.Column(db.Integer, nullable=False)
    roomType = db.Column(db.String(6), nullable=False)
    bedType = db.Column(db.String(5), nullable=False)
    smokingPref = db.Column(db.String(11), nullable=False)
    additionalRequest = db.Column(db.String(100), nullable=False, default='None')

    guest = db.relationship('GuestInformation', backref=db.backref('reservations', cascade='all, delete'))

class CompanionInformation(db.Model):
    __tablename__ = 'companion_information'

    reservationNo = db.Column(db.String(10), db.ForeignKey('reservation_information.reservationNo', ondelete='CASCADE'), primary_key=True)
    companionID = db.Column(db.String(15), primary_key=True)
    compName = db.Column(db.String(60), nullable=False)
    compContactNo = db.Column(db.String(13), nullable=False)
    compEmail = db.Column(db.String(60), nullable=False)
    compAge = db.Column(db.Integer, nullable=False) 
    compSex = db.Column(db.String(1), nullable=False)

    reservation = db.relationship('ReservationInformation', backref=db.backref('companions', cascade='all, delete'))