from flask import Flask
from models import db, GuestInformation
from db_config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

db.init_app(app)

def migrate_guest_ids():
    with app.app_context():
        try:
            # Step 1: Add a temporary column for new guestID
            db.engine.execute("ALTER TABLE guest_information ADD COLUMN new_guestID CHAR(10)")
            logger.info("Added new_guestID column")
        except Exception as e:
            logger.error(f"Failed to add new_guestID column: {str(e)}")
            return

        # Step 2: Update existing records with new guestID format
        guests = GuestInformation.query.all()
        try:
            for index, guest in enumerate(guests, start=1):
                new_guest_id = f"G-{index:08d}"
                guest.new_guestID = new_guest_id
                db.session.commit()
                logger.info(f"Updated guestID {guest.guestID} to {new_guest_id}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to update guest IDs: {str(e)}")
            return

        # Step 3: Drop old guestID column and rename new_guestID
        try:
            db.engine.execute("ALTER TABLE guest_information DROP COLUMN guestID")
            db.engine.execute("ALTER TABLE guest_information CHANGE new_guestID guestID CHAR(10) NOT NULL")
            db.engine.execute("ALTER TABLE guest_information ADD PRIMARY KEY (guestID)")
            logger.info("Renamed new_guestID to guestID and set as primary key")
        except Exception as e:
            logger.error(f"Failed to rename column: {str(e)}")
            db.session.rollback()
            return

        # Step 4: Verify changes
        try:
            guests = GuestInformation.query.all()
            for guest in guests:
                logger.info(f"Guest ID: {guest.guestID}, Name: {guest.guestName}, Email: {guest.guestEmail}")
        except Exception as e:
            logger.error(f"Failed to verify changes: {str(e)}")

if __name__ == '__main__':
    migrate_guest_ids()