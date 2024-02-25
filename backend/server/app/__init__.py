from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://main_admin:Accessors231@81.19.137.188/youchip'
db = SQLAlchemy(app) 
from app import endpoints