from flask import Flask
from flask_cors import CORS
import os

def create_app() -> Flask:
    """Application factory pattern for Benkyo-Fi."""
    
    app = Flask(__name__)

    # Configure CORS for frontend integration
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

    # Configure app
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "superkey-benky-fy")

    # Initialize V2 application
    from .v2 import init_v2_app
    init_v2_app(app)

    return app