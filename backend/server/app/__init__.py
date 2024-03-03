from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://main_admin:Accessors231@46.226.166.162/youchip'
db = SQLAlchemy(app) 
from app import endpoints