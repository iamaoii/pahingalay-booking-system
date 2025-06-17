from flask import Flask, jsonify, render_template, request, redirect, url_for, flash
from flask_cors import CORS
from models import db
# Removed import from db_config.py
from routes.auth import auth_bp
from routes.guests import guests_bp
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5000"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS', 'False').lower() == 'true'
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')

db.init_app(app)
Bcrypt(app)

app.register_blueprint(auth_bp)
app.register_blueprint(guests_bp)

@app.route('/')
def home():
    logger.debug("Rendering home.html as root route")
    return render_template('home.html')

@app.route('/rooms', methods=['GET'])
def rooms_page():
    logger.debug("Rendering rooms.html")
    return render_template('rooms.html')

@app.route('/gallery', methods=['GET'])
def gallery_page():
    logger.debug("Rendering gallery.html")
    return render_template('gallery.html')

@app.route('/contact', methods=['GET'])
def contact_page():
    logger.debug("Rendering contact.html")
    return render_template('contact.html')

@app.route('/signup', methods=['GET'])
def signup_page():
    logger.debug("Rendering signup.html")
    return render_template('signup.html')

@app.route('/signin', methods=['GET'])
def signin_page():
    logger.debug("Rendering signin.html")
    return render_template('signin.html')

@app.route('/booking', methods=['GET'])
def booking_page():
    logger.debug("Rendering booking.html")
    return render_template('booking.html')

@app.route('/booking-confirmation', methods=['GET'])
def confirmation_page():
    logger.debug("Rendering booking-confirmation.html")
    return render_template('booking-confirmation.html')

@app.route('/dashboard', methods=['GET'])
def dashboard_page():
    logger.debug("Rendering dashboard.html")
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    logger.debug("Processing server-side logout")
    flash('You have been signed out.', 'success')
    logger.info("Redirecting to signin")
    return redirect(url_for('signin_page'))

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)