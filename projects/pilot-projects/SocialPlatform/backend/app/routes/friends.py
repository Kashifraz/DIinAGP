from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, FriendRequest, Friend
from app.extensions import db
from datetime import datetime

friends_bp = Blueprint('friends', __name__, url_prefix='/api/friends')

@friends_bp.route('/request', methods=['POST'])
@jwt_required()
def send_friend_request():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    to_user_id = data.get('to_user_id')
    if not to_user_id or user_id == to_user_id:
        return jsonify({'error': 'Invalid user ID'}), 400
    # Check if already friends
    if Friend.query.filter_by(user_id=user_id, friend_id=to_user_id).first() or \
       Friend.query.filter_by(user_id=to_user_id, friend_id=user_id).first():
        return jsonify({'error': 'Already friends'}), 409
    # Check if request already exists
    existing = FriendRequest.query.filter_by(from_user_id=user_id, to_user_id=to_user_id, status='pending').first()
    if existing:
        return jsonify({'error': 'Friend request already sent'}), 409
    # Create friend request
    fr = FriendRequest(from_user_id=user_id, to_user_id=to_user_id, status='pending')
    db.session.add(fr)
    db.session.commit()
    return jsonify({'message': 'Friend request sent'}), 201

@friends_bp.route('/request/<int:request_id>/respond', methods=['POST'])
@jwt_required()
def respond_friend_request(request_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    action = data.get('action')  # 'accept' or 'reject'
    fr = FriendRequest.query.get(request_id)
    if not fr or fr.to_user_id != user_id or fr.status != 'pending':
        return jsonify({'error': 'Invalid or already handled request'}), 404
    if action == 'accept':
        fr.status = 'accepted'
        # Add to friends table (both directions)
        db.session.add(Friend(user_id=fr.from_user_id, friend_id=fr.to_user_id, created_at=datetime.utcnow()))
        db.session.add(Friend(user_id=fr.to_user_id, friend_id=fr.from_user_id, created_at=datetime.utcnow()))
    elif action == 'reject':
        fr.status = 'rejected'
    else:
        return jsonify({'error': 'Invalid action'}), 400
    db.session.commit()
    return jsonify({'message': f'Request {action}ed'}), 200

@friends_bp.route('/requests', methods=['GET'])
@jwt_required()
def list_friend_requests():
    user_id = int(get_jwt_identity())
    # Incoming requests
    incoming = FriendRequest.query.filter_by(to_user_id=user_id).all()
    # Outgoing requests
    outgoing = FriendRequest.query.filter_by(from_user_id=user_id).all()
    def serialize(fr):
        return {
            'id': fr.id,
            'from_user_id': fr.from_user_id,
            'to_user_id': fr.to_user_id,
            'status': fr.status,
            'created_at': fr.created_at.isoformat(),
            'from_user': {
                'id': fr.from_user.id,
                'name': fr.from_user.name,
                'profile_photo': fr.from_user.profile_photo
            } if fr.from_user else None,
            'to_user': {
                'id': fr.to_user.id,
                'name': fr.to_user.name,
                'profile_photo': fr.to_user.profile_photo
            } if fr.to_user else None,
        }
    return jsonify({
        'incoming': [serialize(fr) for fr in incoming],
        'outgoing': [serialize(fr) for fr in outgoing],
    }), 200

@friends_bp.route('/list', methods=['GET'])
@jwt_required()
def list_friends():
    user_id = int(get_jwt_identity())
    friends = Friend.query.filter_by(user_id=user_id).all()
    def serialize(friend):
        return {
            'id': friend.friend.id,
            'name': friend.friend.name,
            'email': friend.friend.email,
            'profile_photo': friend.friend.profile_photo,
            'bio': friend.friend.bio,
        } if friend.friend else None
    return jsonify({'friends': [serialize(f) for f in friends if f.friend]}), 200 