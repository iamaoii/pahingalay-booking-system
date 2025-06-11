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
def index():
    logger.debug("Rendering index.html as root route")
    return render_template('index.html')

@app.route('/signup', methods=['GET'])
def signup_page():
    logger.debug("Rendering signup.html")
    return render_template('signup.html')

@app.route('/signin', methods=['GET'])
def signin_page():
    logger.debug("Rendering signin.html")
    return render_template('signin.html')

@app.route('/dashboard', methods=['GET'])
def dashboard_page():
    logger.debug("Rendering dashboard.html")
    return render_template('dashboard.html')

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)