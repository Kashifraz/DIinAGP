from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Comment, Post, User
from app.extensions import db
from datetime import datetime

comments_bp = Blueprint('comments', __name__, url_prefix='/api/comments')

@comments_bp.route('', methods=['POST'])
@jwt_required()
def add_comment():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    post_id = data.get('post_id')
    text = data.get('text', '').strip()
    if not post_id or not text:
        return jsonify({'error': 'post_id and text are required'}), 400
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    comment = Comment(post_id=post_id, user_id=user_id, text=text)
    db.session.add(comment)
    db.session.commit()
    return jsonify({'message': 'Comment added', 'comment_id': comment.id}), 201

@comments_bp.route('', methods=['GET'])
@jwt_required()
def list_comments():
    post_id = request.args.get('post_id')
    if not post_id:
        return jsonify({'error': 'post_id is required'}), 400
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    def serialize(comment):
        return {
            'id': comment.id,
            'post_id': comment.post_id,
            'user_id': comment.user_id,
            'user_name': comment.user.name if comment.user else '',
            'user_profile_photo': comment.user.profile_photo if comment.user else None,
            'text': comment.text,
            'created_at': comment.created_at.isoformat(),
        }
    return jsonify({'comments': [serialize(c) for c in comments]}), 200

@comments_bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)
    if not comment or comment.user_id != user_id:
        return jsonify({'error': 'Not found or not authorized'}), 404
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200 