#!/usr/bin/env python3
"""
Simple test script to check if the Flask app can be imported and created.
Run this to debug import or configuration issues.
"""

import os
import sys

print("Testing Flask app import and creation...")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

try:
    print("Importing app module...")
    from app import create_app
    print("✓ App module imported successfully")
    
    print("Creating Flask app...")
    app = create_app()
    print("✓ Flask app created successfully")
    
    print("App config:")
    print(f"  - Secret key: {'Set' if app.secret_key else 'Not set'}")
    print(f"  - Debug mode: {app.debug}")
    print(f"  - Environment: {app.env}")
    
    print("\n✓ All tests passed! App is ready to run.")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    print("Check if all dependencies are installed and modules exist.")
    
except Exception as e:
    print(f"✗ Error creating app: {e}")
    print("Check environment variables and configuration.")
    
    # Check environment variables
    print("\nEnvironment variables:")
    print(f"  - GOOGLE_OAUTH_CLIENT_ID: {'Set' if os.getenv('GOOGLE_OAUTH_CLIENT_ID') else 'Not set'}")
    print(f"  - GOOGLE_OAUTH_CLIENT_SECRET: {'Set' if os.getenv('GOOGLE_OAUTH_CLIENT_SECRET') else 'Not set'}")
    print(f"  - FLASK_SECRET_KEY: {'Set' if os.getenv('FLASK_SECRET_KEY') else 'Not set'}")
