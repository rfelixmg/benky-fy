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

def test_get_conjugations_verb(client):
    """Test the V2 conjugation endpoint with a verb."""
    # First get a word to test with
    response = client.get('/v2/words/verbs')
    assert response.status_code == 200
    words_data = json.loads(response.data)
    
    if words_data['words']:
        word_id = words_data['words'][0]['id']
        
        # Test conjugation endpoint
        response = client.get(f'/v2/conjugation/{word_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'word_id' in data
        assert 'base_form' in data
        assert 'conjugations' in data
        assert isinstance(data['conjugations'], list)
        
        # Verify conjugation structure
        if data['conjugations']:
            conjugation = data['conjugations'][0]
            assert 'form' in conjugation
            assert 'kanji' in conjugation
            assert 'hiragana' in conjugation

def test_get_conjugations_nonexistent_word(client):
    """Test the V2 conjugation endpoint with a nonexistent word ID."""
    response = client.get('/v2/conjugation/nonexistent-id')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data

def test_get_conjugations_adjective(client):
    """Test the V2 conjugation endpoint with an adjective."""
    # First get an adjective to test with
    response = client.get('/v2/words/adjectives')
    assert response.status_code == 200
    words_data = json.loads(response.data)
    
    if words_data['words']:
        word_id = words_data['words'][0]['id']
        
        # Test conjugation endpoint
        response = client.get(f'/v2/conjugation/{word_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'word_id' in data
        assert 'base_form' in data
        assert 'conjugations' in data
        assert isinstance(data['conjugations'], list)
