from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://yc_admin:00000000@5.182.87.23/YC'
db = SQLAlchemy(app) 
from app import endpoints