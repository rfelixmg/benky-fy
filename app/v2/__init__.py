from flask import Flask

def init_v2_app(app: Flask):
    """Initialize V2 application components."""
    
    # Import V2 RESTX blueprints
    from .words.routes import bp as words_bp
    from .conjugation.routes import bp as conjugation_bp
    from .settings.routes import bp as settings_bp
    from .common.json_utils import compress_json
    
    # Register V2 blueprints without URL prefix (Flask-RESTX handles this internally)
    app.register_blueprint(words_bp)
    app.register_blueprint(conjugation_bp)
    app.register_blueprint(settings_bp)
    
    # Apply compression decorator to all V2 JSON responses
    for endpoint in app.view_functions:
        if endpoint.startswith('v2_'):
            app.view_functions[endpoint] = compress_json(app.view_functions[endpoint])
