from flask import Flask


def create_app() -> Flask:
	"""Application factory pattern for Benkyo-Fi."""
	
	app = Flask(__name__, static_folder="static", template_folder="templates")

	# Register blueprints
	from .routes import main_bp
	from .module1 import module1_bp

	app.register_blueprint(main_bp)
	app.register_blueprint(module1_bp, url_prefix="/module1")

	return app


