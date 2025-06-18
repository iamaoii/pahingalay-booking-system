from app import app, db
from models import RoomPrice
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

with app.app_context():
    try:
        db.create_all()  # Ensure all tables are created
        # Check if table is empty to avoid duplicates
        if not RoomPrice.query.first():
            prices = [
                RoomPrice(roomType='single', price=999.0),
                RoomPrice(roomType='double', price=1499.0),
                RoomPrice(roomType='suite', price=2499.0),
                RoomPrice(roomType='family', price=3499.0)
            ]
            db.session.bulk_save_objects(prices)
            db.session.commit()
            logger.info("RoomPrice table initialized successfully.")
        else:
            logger.info("RoomPrice table already contains data.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to initialize RoomPrice table: {str(e)}")