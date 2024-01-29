from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///players.db?check_same_thread=False&mode=WAL'
db = SQLAlchemy(app) 
from app import endpoints