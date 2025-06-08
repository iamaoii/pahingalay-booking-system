from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

import os

# Replace these with your actual credentials
DB_USER = 'root'
DB_PASSWORD = 'password'
DB_HOST = 'localhost'
DB_PORT = '3306'
DB_NAME = 'pahingalay_db'

SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://root:password@localhost:3306/pahingalay_db"

SQLALCHEMY_TRACK_MODIFICATIONS = False
