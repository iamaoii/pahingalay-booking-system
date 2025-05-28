from flask import Flask, jsonify
from flask_cors import CORS
from models import db, GuestInformation

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



# ✅ Run the app
if __name__ == '__main__':
    app.run(debug=True)