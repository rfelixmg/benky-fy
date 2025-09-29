from flask import Flask

def init_v2_app(app: Flask):
    """Initialize V2 application components."""
    
    # Import V2 blueprints
    from .words.routes import bp as words_bp
    from .common.json_utils import compress_json
    
    # Register V2 blueprints (routes already include version prefix)
    app.register_blueprint(words_bp)
    
    # Apply compression decorator to all V2 JSON responses
    for endpoint in app.view_functions:
        if endpoint.startswith('v2_'):
            app.view_functions[endpoint] = compress_json(app.view_functions[endpoint])
