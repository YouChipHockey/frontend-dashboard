from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://youchip_admin:00000000@77.221.156.184/yochip'
db = SQLAlchemy(app) 
from app import endpoints