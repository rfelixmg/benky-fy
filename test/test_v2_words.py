import pytest
from app import create_app
import json

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

def test_get_words_endpoint(client):
    """Test the V2 words endpoint."""
    # Test with an existing module
    response = client.get('/v2/words/hiragana')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'words' in data
    assert isinstance(data['words'], list)
    
    # Verify word structure
    if data['words']:
        word = data['words'][0]
        assert 'id' in word
        assert 'kanji' in word
        assert 'hiragana' in word
        assert 'english' in word
        assert 'type' in word

def test_get_words_nonexistent_module(client):
    """Test the V2 words endpoint with a nonexistent module."""
    response = client.get('/v2/words/nonexistent')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['words'] == []
