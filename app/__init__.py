from flask import Flask, jsonify
from flask_cors import CORS
import os

def create_app() -> Flask:
    """Application factory pattern for Benkyo-Fi."""
    
    app = Flask(__name__)

    # Configure CORS for frontend integration
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

    # Configure app
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "superkey-benky-fy")

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'benky-fy-backend'}), 200

    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found', 'status': 404}), 404
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request', 'status': 400}), 400
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error', 'status': 500}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'error': 'An unexpected error occurred', 'status': 500}), 500

    # Initialize V2 application
    from .v2 import init_v2_app
    init_v2_app(app)

    return app