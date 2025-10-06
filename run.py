from app import create_app
import os
from dotenv import load_dotenv

# Load environment variables from .environment file
load_dotenv('.environment')

try:
    app = create_app()
except Exception as e:
    print(f"Error creating app: {e}")
    raise

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    host = '0.0.0.0' if os.environ.get('FLASK_ENV') == 'production' else 'localhost'
    
    app.run(debug=debug, host=host, port=port)


