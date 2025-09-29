from flask import Flask, session, request
import os
import uuid
from flask_dance.contrib.google import make_google_blueprint
from .utils.logger import logger


def create_app() -> Flask:
	"""Application factory pattern for Benkyo-Fi."""
	
	app = Flask(__name__, static_folder="static", template_folder="templates")

	# Secret key for sessions (required by Flask and Flask-Dance)
	app.secret_key = os.environ.get("FLASK_SECRET_KEY", "superkey-benky-fy")
	
	@app.before_request
	def before_request():
		# Generate session ID if not present
		if 'session_id' not in session:
			session['session_id'] = str(uuid.uuid4())

	# Register blueprints
	from .routes import main_bp
	from .auth import auth_bp
	
	# Register help blueprint
	from .help.blueprints.help_bp import HelpBlueprint
	help_bp = HelpBlueprint().create_blueprint()
	app.register_blueprint(help_bp)
	
	# Register conjugation blueprint
	from .conjugation.blueprints.conjugation_bp import create_conjugation_blueprint
	conjugation_bp = create_conjugation_blueprint()
	app.register_blueprint(conjugation_bp, url_prefix="/conjugation")

	# Import and create flashcard modules
	from .flashcard import create_vocab_flashcard_module, create_verb_flashcard_module, create_adjective_flashcard_module, create_katakana_flashcard_module, create_custom_practice_module
	
	# Create flashcard modules (only for existing data files)
	hiragana_bp = create_vocab_flashcard_module("hiragana", "./datum/hiragana.json")
	katakana_bp = create_katakana_flashcard_module("katakana", "./datum/katakana.json")
	verbs_bp = create_verb_flashcard_module("verbs", "./datum/verbs.json")
	adjectives_bp = create_adjective_flashcard_module("adjectives", "./datum/adjectives.json")
	
	# Create vocabulary modules
	numbers_basic_bp = create_vocab_flashcard_module("numbers_basic", "./datum/numbers_basic.json")
	numbers_extended_bp = create_vocab_flashcard_module("numbers_extended", "./datum/numbers_extended.json")
	days_of_week_bp = create_vocab_flashcard_module("days_of_week", "./datum/days_of_week.json")
	months_complete_bp = create_vocab_flashcard_module("months_complete", "./datum/months_complete.json")
	colors_basic_bp = create_vocab_flashcard_module("colors_basic", "./datum/colors_basic.json")
	greetings_essential_bp = create_vocab_flashcard_module("greetings_essential", "./datum/greetings_essential.json")
	question_words_bp = create_vocab_flashcard_module("question_words", "./datum/question_words.json")
	base_nouns_bp = create_vocab_flashcard_module("base_nouns", "./datum/base_nouns.json")
	katakana_words_bp = create_katakana_flashcard_module("katakana_words", "./datum/katakana_words.json")
	
	# Create custom practice module
	custom_practice_bp = create_custom_practice_module()

	# Google OAuth with Flask-Dance (only if not in test mode)
	from app.auth import is_test_mode
	
	is_test, context = is_test_mode()
	app.logger.debug(f"Test mode status: is_test={is_test}, context={context}")
	
	if not is_test:
		google_client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
		google_client_secret = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
		
		if not google_client_id or not google_client_secret:
			raise ValueError("Google OAuth credentials not found. Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET environment variables.")
		
		google_bp = make_google_blueprint(
			client_id=google_client_id,
			client_secret=google_client_secret,
			scope=["profile", "email"],
			redirect_to="main.home",
		)
		
		# Register Google OAuth blueprint
		app.register_blueprint(google_bp, url_prefix="/login")

	app.register_blueprint(main_bp)
	app.register_blueprint(auth_bp, url_prefix="/auth")  # Add URL prefix for auth routes
	app.register_blueprint(hiragana_bp, url_prefix="/begginer/hiragana")
	app.register_blueprint(katakana_bp, url_prefix="/begginer/katakana")
	app.register_blueprint(verbs_bp, url_prefix="/begginer/verbs")
	app.register_blueprint(adjectives_bp, url_prefix="/begginer/adjectives")
	
	# Register vocabulary modules
	app.register_blueprint(numbers_basic_bp, url_prefix="/begginer/numbers-basic")
	app.register_blueprint(numbers_extended_bp, url_prefix="/begginer/numbers-extended")
	app.register_blueprint(days_of_week_bp, url_prefix="/begginer/days-of-week")
	app.register_blueprint(months_complete_bp, url_prefix="/begginer/months")
	app.register_blueprint(colors_basic_bp, url_prefix="/begginer/colors")
	app.register_blueprint(greetings_essential_bp, url_prefix="/begginer/greetings")
	app.register_blueprint(question_words_bp, url_prefix="/begginer/question-words")
	app.register_blueprint(base_nouns_bp, url_prefix="/begginer/base_nouns")
	app.register_blueprint(katakana_words_bp, url_prefix="/begginer/katakana-words")
	
	# Register custom practice module
	app.register_blueprint(custom_practice_bp, url_prefix="/custom-practice")

	# Make session user available in all templates as `current_user`
	@app.context_processor
	def inject_user():
		return {"current_user": session.get("user")}

	return app


