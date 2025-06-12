from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
from app.extensions import db
import os
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

# Configure upload settings
UPLOAD_FOLDER = 'uploads/profile_photos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'bio': user.bio,
        'profile_photo': user.profile_photo,
        'created_at': user.created_at.isoformat()
    }), 200

@profile_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    name = data.get('name', '').strip()
    bio = data.get('bio', '').strip()
    
    if name:
        user.name = name
    if bio is not None:  # Allow empty bio
        user.bio = bio
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'bio': user.bio,
            'profile_photo': user.profile_photo
        }
    }), 200

@profile_bp.route('/upload-photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'photo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{user_id}_{file.filename}")
        
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Update user's profile photo URL
        user.profile_photo = f"/uploads/profile_photos/{filename}"
        db.session.commit()
        
        return jsonify({
            'message': 'Profile photo uploaded successfully',
            'profile_photo': user.profile_photo
        }), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

@profile_bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    # Search by name or email (case-insensitive)
    users = User.query.filter(
        db.or_(
            User.name.ilike(f'%{query}%'),
            User.email.ilike(f'%{query}%')
        )
    ).limit(20).all()
    
    results = []
    for user in users:
        results.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'bio': user.bio,
            'profile_photo': user.profile_photo
        })
    
    return jsonify({'users': results}), 200 