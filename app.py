from flask import Flask, jsonify
from flask_cors import CORS
from models import db, GuestInformation
from flask import request

app = Flask(__name__)
CORS(app)

# Load database config from db_config.py
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:password@localhost/pahingalay_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the Flask backend!'})

@app.route('/guests')
def get_guests():   
    guests = GuestInformation.query.all()
    result = []
    for guest in guests:
        guest_data = {
            'guestID': guest.guestID,
            'guestName': guest.guestName,
            'guestEmail': guest.guestEmail,
            'guestContactNo': guest.guestContactNo,
            'guestSex': guest.guestSex,
            'guestAge': guest.guestAge,
            'nationality': guest.nationality,
            'address': guest.address
        }
        result.append(guest_data)
    return jsonify(result)

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')  # Only if you're storing a password field

    # 🔁 Check if user exists in DB
    guest = GuestInformation.query.filter_by(guestEmail=email).first()

    if guest and guest.password == password:  # You'll need a `password` column in your table
        return jsonify({'message': 'Login successful', 'status': 'success'}), 200
    else:
        return jsonify({'message': 'Invalid email or password', 'status': 'fail'}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    




# ✅ Run the app
if __name__ == '__main__':
    app.run(debug=True)