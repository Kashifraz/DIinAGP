from .test import test_bp
from .auth import auth_bp
from .profile import profile_bp
from .friends import friends_bp
from .posts import posts_bp
from .comments import comments_bp
from .likes import likes_bp

def register_blueprints(app):
    app.register_blueprint(test_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp) 
    app.register_blueprint(friends_bp) 
    app.register_blueprint(posts_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(likes_bp)