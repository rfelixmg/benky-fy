import pytest
from app import create_app
import json
import os
import tempfile
import shutil

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app()
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def temp_feedback_dir():
    """Create a temporary directory for feedback logs during testing."""
    temp_dir = tempfile.mkdtemp()
    original_dir = "./logs/feedback"
    
    # Create temp feedback directory
    temp_feedback_dir = os.path.join(temp_dir, "feedback")
    os.makedirs(temp_feedback_dir, exist_ok=True)
    
    # Mock the feedback directory path
    import benky_fy.app.v2.feedback.routes as feedback_module
    original_store_func = feedback_module._store_feedback_data
    
    def mock_store_feedback_data(data):
        try:
            import uuid
            from datetime import datetime
            
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            filename = f"feedback_{timestamp}_{unique_id}.json"
            filepath = os.path.join(temp_feedback_dir, filename)
            
            # Add processing metadata
            feedback_record = {
                "id": str(uuid.uuid4()),
                "processed_at": datetime.now().isoformat(),
                "data": data
            }
            
            # Write to file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(feedback_record, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            print(f"Error storing feedback data: {e}")
            return False
    
    feedback_module._store_feedback_data = mock_store_feedback_data
    
    yield temp_feedback_dir
    
    # Cleanup
    feedback_module._store_feedback_data = original_store_func
    shutil.rmtree(temp_dir)

def test_feedback_endpoint_success(client, temp_feedback_dir):
    """Test successful feedback recording."""
    feedback_data = {
        "moduleName": "verbs",
        "itemId": "a1e9e1b8-4846-5387-9b64-881e21bd7a0d",
        "userAnswer": "red",
        "isCorrect": True,
        "matchedType": "english",
        "attempts": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "settings": {
            "input_hiragana": True,
            "input_katakana": False,
            "input_english": True,
            "input_kanji": False,
            "input_romaji": True,
            "display_mode": "kanji",
            "furigana_style": "inline"
        }
    }
    
    response = client.post('/v2/feedback/answer', 
                          json=feedback_data,
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] == True
    assert 'Feedback recorded successfully' in data['message']

def test_feedback_endpoint_missing_fields(client):
    """Test feedback endpoint with missing required fields."""
    incomplete_data = {
        "moduleName": "verbs",
        "itemId": "a1e9e1b8-4846-5387-9b64-881e21bd7a0d",
        "userAnswer": "red",
        "isCorrect": True
        # Missing: matchedType, attempts, timestamp, settings
    }
    
    response = client.post('/v2/feedback/answer', 
                          json=incomplete_data,
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Missing required field' in data['message']

def test_feedback_endpoint_invalid_data_types(client):
    """Test feedback endpoint with invalid data types."""
    invalid_data = {
        "moduleName": "verbs",
        "itemId": "a1e9e1b8-4846-5387-9b64-881e21bd7a0d",
        "userAnswer": "red",
        "isCorrect": "true",  # Should be boolean
        "matchedType": "english",
        "attempts": "1",  # Should be integer
        "timestamp": "2024-01-15T10:30:00Z",
        "settings": {
            "input_hiragana": True,
            "input_katakana": False,
            "input_english": True,
            "input_kanji": False,
            "input_romaji": True,
            "display_mode": "kanji",
            "furigana_style": "inline"
        }
    }
    
    response = client.post('/v2/feedback/answer', 
                          json=invalid_data,
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Invalid feedback data' in data['message']

def test_feedback_endpoint_invalid_settings(client):
    """Test feedback endpoint with invalid settings structure."""
    invalid_settings_data = {
        "moduleName": "verbs",
        "itemId": "a1e9e1b8-4846-5387-9b64-881e21bd7a0d",
        "userAnswer": "red",
        "isCorrect": True,
        "matchedType": "english",
        "attempts": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "settings": {
            "input_hiragana": "true",  # Should be boolean
            "input_katakana": False,
            "input_english": True,
            "input_kanji": False,
            "input_romaji": True,
            "display_mode": "kanji",
            "furigana_style": "inline"
        }
    }
    
    response = client.post('/v2/feedback/answer', 
                          json=invalid_settings_data,
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Invalid feedback data' in data['message']

def test_feedback_endpoint_empty_request(client):
    """Test feedback endpoint with empty request body."""
    response = client.post('/v2/feedback/answer', 
                          json=None,
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Request body must contain JSON data' in data['message']

def test_feedback_endpoint_no_content_type(client):
    """Test feedback endpoint without proper content type."""
    feedback_data = {
        "moduleName": "verbs",
        "itemId": "a1e9e1b8-4846-5387-9b64-881e21bd7a0d",
        "userAnswer": "red",
        "isCorrect": True,
        "matchedType": "english",
        "attempts": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "settings": {
            "input_hiragana": True,
            "input_katakana": False,
            "input_english": True,
            "input_kanji": False,
            "input_romaji": True,
            "display_mode": "kanji",
            "furigana_style": "inline"
        }
    }
    
    response = client.post('/v2/feedback/answer', 
                          data=json.dumps(feedback_data))
    
    # Should still work as Flask can parse JSON without explicit content type
    assert response.status_code == 200

def test_feedback_endpoint_negative_attempts(client):
    """Test feedback endpoint with negative attempts."""
    invalid_data = {
        "moduleName": "verbs",
        "itemId": "a1e9e1b8-4846-5387-9b64-881e21bd7a0d",
        "userAnswer": "red",
        "isCorrect": True,
        "matchedType": "english",
        "attempts": -1,  # Should be positive
        "timestamp": "2024-01-15T10:30:00Z",
        "settings": {
            "input_hiragana": True,
            "input_katakana": False,
            "input_english": True,
            "input_kanji": False,
            "input_romaji": True,
            "display_mode": "kanji",
            "furigana_style": "inline"
        }
    }
    
    response = client.post('/v2/feedback/answer', 
                          json=invalid_data,
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'attempts must be a positive integer' in data['message']

def test_feedback_endpoint_empty_strings(client):
    """Test feedback endpoint with empty string values."""
    invalid_data = {
        "moduleName": "",  # Empty string
        "itemId": "a1e9e1b8-4846-5387-9b64-881e21bd7a0d",
        "userAnswer": "red",
        "isCorrect": True,
        "matchedType": "english",
        "attempts": 1,
        "timestamp": "2024-01-15T10:30:00Z",
        "settings": {
            "input_hiragana": True,
            "input_katakana": False,
            "input_english": True,
            "input_kanji": False,
            "input_romaji": True,
            "display_mode": "kanji",
            "furigana_style": "inline"
        }
    }
    
    response = client.post('/v2/feedback/answer', 
                          json=invalid_data,
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'moduleName must be a non-empty string' in data['message']
