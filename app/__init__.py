from flask import Flask, session, request
import os
from flask_dance.contrib.google import make_google_blueprint


def create_app() -> Flask:
	"""Application factory pattern for Benkyo-Fi."""
	
	app = Flask(__name__, static_folder="static", template_folder="templates")

	# Secret key for sessions (required by Flask and Flask-Dance)
	app.secret_key = os.environ.get("FLASK_SECRET_KEY", "superkey-benky-fy")

	# Register blueprints
	from .routes import main_bp
	from .module1 import module1_bp
	from .auth import auth_bp

	# Google OAuth with Flask-Dance
	google_client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
	google_client_secret = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
	
	if not google_client_id or not google_client_secret:
		raise ValueError("Google OAuth credentials not found. Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET environment variables.")
	
	google_bp = make_google_blueprint(
		client_id=google_client_id,
		client_secret=google_client_secret,
		scope=["profile", "email"],
	)

	app.register_blueprint(main_bp)
	app.register_blueprint(module1_bp, url_prefix="/module1")
	app.register_blueprint(auth_bp)
	
	# Register Google OAuth blueprint
	app.register_blueprint(google_bp, url_prefix="/login")

	# Make session user available in all templates as `current_user`
	@app.context_processor
	def inject_user():
		return {"current_user": session.get("user")}

	return app


