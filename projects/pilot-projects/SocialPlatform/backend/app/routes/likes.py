from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Like, Post
from app.extensions import db
from datetime import datetime

likes_bp = Blueprint('likes', __name__, url_prefix='/api/likes')

@likes_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle_like():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    post_id = data.get('post_id')
    if not post_id:
        return jsonify({'error': 'post_id is required'}), 400
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    like = Like.query.filter_by(post_id=post_id, user_id=user_id).first()
    if like:
        db.session.delete(like)
        db.session.commit()
        return jsonify({'message': 'Unliked', 'liked': False}), 200
    else:
        new_like = Like(post_id=post_id, user_id=user_id, created_at=datetime.utcnow())
        db.session.add(new_like)
        db.session.commit()
        return jsonify({'message': 'Liked', 'liked': True}), 201

@likes_bp.route('/count', methods=['GET'])
@jwt_required()
def like_count():
    post_id = request.args.get('post_id')
    if not post_id:
        return jsonify({'error': 'post_id is required'}), 400
    count = Like.query.filter_by(post_id=post_id).count()
    return jsonify({'post_id': post_id, 'like_count': count}), 200 