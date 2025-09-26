from app import create_app
import os
from dotenv import load_dotenv

# Load environment variables from .environment file
load_dotenv('.environment')

try:
    app = create_app()
except Exception as e:
    print(f"Error creating app: {e}")
    print("Make sure all required environment variables are set:")
    print("- GOOGLE_OAUTH_CLIENT_ID")
    print("- GOOGLE_OAUTH_CLIENT_SECRET")
    raise

if __name__ == "__main__":
    # app.run(debug=True, host='localhost', port=5000)
    # app.run(debug=True, host='localhost', port=8080)
    app.run(debug=True, host='localhost', port=8080)
    # app.run(debug=True, host='0.0.0.0', port=8080)
    # app.run()


