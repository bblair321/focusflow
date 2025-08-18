from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, User
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    """Decorator to require authentication for protected routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # For now, we'll use a simple header-based auth
        # Later this will be replaced with JWT tokens
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        # Extract user ID from token (simplified for now)
        # In production, this would decode a JWT token
        try:
            user_id = int(auth_header.split(' ')[1])
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'Invalid token'}), 401
            request.user_id = user_id
        except (ValueError, IndexError):
            return jsonify({'error': 'Invalid token format'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username']
    password = data['password']
    
    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    # Create new user
    hashed_password = generate_password_hash(password)
    user = User(username=username, password=hashed_password)
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user_id': user.id,
        'username': user.username
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return user ID (temporary token)"""
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username']
    password = data['password']
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # For now, return user ID as a simple token
    # Later this will be replaced with a proper JWT token
    return jsonify({
        'message': 'Login successful',
        'user_id': user.id,
        'username': user.username,
        'token': str(user.id)  # Simple token for now
    })
