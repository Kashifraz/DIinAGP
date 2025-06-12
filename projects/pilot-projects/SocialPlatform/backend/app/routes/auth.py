# Placeholder for authentication routes (register, login, logout) 

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models import User
from app.extensions import db
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Email validation regex
EMAIL_REGEX = re.compile(r"[^@]+@[^@]+\.[^@]+")

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Input validation
    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400
    if not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Invalid email address.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered.'}), 409

    password_hash = generate_password_hash(password)
    user = User(name=name, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'message': 'User registered successfully.', 'access_token': access_token}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'message': 'Login successful.', 'access_token': access_token}), 200 