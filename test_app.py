#!/usr/bin/env python3
"""
Quick test script to verify the app works with test mode.
"""

import os
import hashlib

# Set test mode
expected_hash = hashlib.sha256(b'benky-fy-test-mode-2024').hexdigest()
os.environ['BENKY_FY_TEST_HASH'] = expected_hash

# Now test the app
try:
    from app import create_app
    app = create_app()
    print("✅ App created successfully!")
    print("✅ Test mode is working!")
    
    # Test a simple route
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['user'] = {
                "name": "Test User",
                "email": "test@benky-fy.com",
                "picture": "https://via.placeholder.com/150/4285f4/ffffff?text=T",
                "is_test_user": True
            }
        
        # Test flashcard page
        response = client.get('/begginer/verbs/')
        print(f"✅ Flashcard page: {response.status_code}")
        
        # Test API endpoint
        response = client.get('/begginer/verbs/api/display-text?item_id=1')
        print(f"✅ Display text API: {response.status_code}")
        
        # Test help API
        response = client.get('/help/api/word-info?module_name=verbs&item_id=1')
        print(f"✅ Help API: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
