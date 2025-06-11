import os
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/pahingalay_db'
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'FLASK_SECRET_KEY')  # Use a secure key