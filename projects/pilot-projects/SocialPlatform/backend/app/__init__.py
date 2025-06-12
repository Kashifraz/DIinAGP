from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt
from .routes import register_blueprints
from flask_cors import CORS
from flask import send_from_directory, make_response
import os

# Import models to ensure they are registered with SQLAlchemy
from . import models

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)  # Enable CORS for all routes

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    register_blueprints(app)

    # Serve uploaded profile photos with CORS and cross-origin headers
    @app.route('/uploads/profile_photos/<filename>')
    def uploaded_file(filename):
        upload_dir = os.path.join(app.root_path, '..', 'uploads', 'profile_photos')
        response = make_response(send_from_directory(upload_dir, filename))
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Timing-Allow-Origin'] = '*'
        return response

    # Serve uploaded post images with CORS and cross-origin headers
    @app.route('/uploads/post_images/<filename>')
    def uploaded_post_image(filename):
        upload_dir = os.path.join(app.root_path, '..', 'uploads', 'post_images')
        response = make_response(send_from_directory(upload_dir, filename))
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Timing-Allow-Origin'] = '*'
        return response

    return app 