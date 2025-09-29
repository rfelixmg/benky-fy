from flask import Blueprint, session
from flask_dance.contrib.google import make_google_blueprint

def _version_prefix(path: str) -> str:
    """Helper function to add V1 API version prefix to routes."""
    if not path:
        return "/v1"
    return f"/v1{path}"

def init_v1_app(app):
    """Initialize V1 application components."""
    
    # Register core blueprints
    from .routes import main_bp
    from .auth import auth_bp
    
    # Register help blueprint
    from .help.blueprints.help_bp import HelpBlueprint
    help_bp = HelpBlueprint().create_blueprint()
    app.register_blueprint(help_bp, url_prefix=_version_prefix("/help"))
    
    # Register conjugation blueprint
    from .conjugation.blueprints.conjugation_bp import create_conjugation_blueprint
    conjugation_bp = create_conjugation_blueprint()
    app.register_blueprint(conjugation_bp, url_prefix=_version_prefix("/conjugation"))

    # Import and create flashcard modules
    from .flashcard import (
        create_vocab_flashcard_module,
        create_verb_flashcard_module,
        create_adjective_flashcard_module,
        create_katakana_flashcard_module
    )
    
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

    # Google OAuth setup (only if not in test mode)
    from .auth import is_test_mode
    
    is_test, context = is_test_mode()
    if not is_test:
        google_client_id = app.config.get("GOOGLE_OAUTH_CLIENT_ID")
        google_client_secret = app.config.get("GOOGLE_OAUTH_CLIENT_SECRET")
        
        if google_client_id and google_client_secret:
            google_bp = make_google_blueprint(
                client_id=google_client_id,
                client_secret=google_client_secret,
                scope=["profile", "email"],
                redirect_to="main.home",
            )
            app.register_blueprint(google_bp, url_prefix="/login")

    # Register core blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix=_version_prefix("/auth"))
    
    # Register module blueprints
    app.register_blueprint(hiragana_bp, url_prefix=_version_prefix("/begginer/hiragana"))
    app.register_blueprint(katakana_bp, url_prefix=_version_prefix("/begginer/katakana"))
    app.register_blueprint(verbs_bp, url_prefix=_version_prefix("/begginer/verbs"))
    app.register_blueprint(adjectives_bp, url_prefix=_version_prefix("/begginer/adjectives"))
    
    # Register vocabulary modules
    app.register_blueprint(numbers_basic_bp, url_prefix=_version_prefix("/begginer/numbers-basic"))
    app.register_blueprint(numbers_extended_bp, url_prefix=_version_prefix("/begginer/numbers-extended"))
    app.register_blueprint(days_of_week_bp, url_prefix=_version_prefix("/begginer/days-of-week"))
    app.register_blueprint(months_complete_bp, url_prefix=_version_prefix("/begginer/months"))
    app.register_blueprint(colors_basic_bp, url_prefix=_version_prefix("/begginer/colors"))
    app.register_blueprint(greetings_essential_bp, url_prefix=_version_prefix("/begginer/greetings"))
    app.register_blueprint(question_words_bp, url_prefix=_version_prefix("/begginer/question-words"))
    app.register_blueprint(base_nouns_bp, url_prefix=_version_prefix("/begginer/base_nouns"))
    app.register_blueprint(katakana_words_bp, url_prefix=_version_prefix("/begginer/katakana-words"))

    # Make session user available in all templates
    @app.context_processor
    def inject_user():
        return {"current_user": session.get("user")}
