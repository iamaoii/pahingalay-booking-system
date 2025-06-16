from flask import Flask, jsonify, render_template
from flask_cors import CORS
from models import db
from db_config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, SECRET_KEY
from routes.auth import auth_bp
from routes.guests import guests_bp
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
import logging
from flask import session, redirect, url_for, flash

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5000"}})  # Same origin, for safety

app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', SECRET_KEY)

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

@app.route('/dashboard', methods=['GET'])
def dashboard_page():
    logger.debug("Rendering dashboard.html")
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    logger.debug("Processing server-side logout")
    session.pop('user_id', None)
    session.clear()
    flash('You have been signed out.', 'success')
    logger.info("User session cleared, redirecting to signin")
    return redirect(url_for('signin_page'))

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)