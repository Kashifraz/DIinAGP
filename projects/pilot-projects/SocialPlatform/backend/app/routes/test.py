from flask import Blueprint, jsonify

test_bp = Blueprint('test', __name__, url_prefix='/api')
 
@test_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working!"}), 200 