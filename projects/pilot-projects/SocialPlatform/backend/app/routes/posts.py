from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Post, Friend
from app.extensions import db
from datetime import datetime
import os
from werkzeug.utils import secure_filename

posts_bp = Blueprint('posts', __name__, url_prefix='/api/posts')

UPLOAD_FOLDER = 'uploads/post_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@posts_bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    text = request.form.get('text', '').strip()
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"user_{user_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}")
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            image_url = f"/uploads/post_images/{filename}"
        else:
            return jsonify({'error': 'Invalid image file'}), 400
    if not text and not image_url:
        return jsonify({'error': 'Post must have text or image'}), 400
    post = Post(user_id=user_id, text=text if text else None, image_url=image_url)
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'Post created', 'post_id': post.id}), 201

@posts_bp.route('', methods=['GET'])
@jwt_required()
def list_posts():
    user_id = int(get_jwt_identity())
    # Get friend ids
    friends = Friend.query.filter_by(user_id=user_id).all()
    friend_ids = [f.friend_id for f in friends]
    # Include self
    friend_ids.append(user_id)
    posts = Post.query.filter(Post.user_id.in_(friend_ids)).order_by(Post.created_at.desc()).all()
    def serialize(post):
        return {
            'id': post.id,
            'user_id': post.user_id,
            'user_name': post.user.name if post.user else '',
            'user_profile_photo': post.user.profile_photo if post.user else None,
            'text': post.text,
            'image_url': post.image_url,
            'created_at': post.created_at.isoformat(),
        }
    return jsonify({'posts': [serialize(p) for p in posts]}), 200

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post or post.user_id != user_id:
        return jsonify({'error': 'Not found or not authorized'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'}), 200

@posts_bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
def edit_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post or post.user_id != user_id:
        return jsonify({'error': 'Not found or not authorized'}), 404
    text = request.form.get('text', '').strip()
    if text:
        post.text = text
    # Handle image update (optional)
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"user_{user_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}")
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            post.image_url = f"/uploads/post_images/{filename}"
        else:
            return jsonify({'error': 'Invalid image file'}), 400
    db.session.commit()
    return jsonify({'message': 'Post updated'}), 200 