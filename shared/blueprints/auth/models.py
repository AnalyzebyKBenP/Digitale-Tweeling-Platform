from flask_login import UserMixin

# needed when logging in based on a table
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class User(UserMixin, db.Model):
    __table_args__ = {'schema': 'security'}
    __tablename__ = "webapp_users"
    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(1000))