from flask import Flask
from flask_cors import CORS
import os

def create_app() -> Flask:
    """Application factory pattern for Benkyo-Fi."""
    
    app = Flask(__name__, static_folder="static", template_folder="templates")

    # Configure CORS for frontend integration
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

    # Configure app
    app.secret_key = os.environ.get("FLASK_SECRET_KEY", "superkey-benky-fy")
    
    # Set OAuth credentials in config
    app.config["GOOGLE_OAUTH_CLIENT_ID"] = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
    app.config["GOOGLE_OAUTH_CLIENT_SECRET"] = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")

    # Initialize V1 application
    from .v1 import init_v1_app
    init_v1_app(app)

    # Initialize V2 application
    from .v2 import init_v2_app
    init_v2_app(app)

    return app