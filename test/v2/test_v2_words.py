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

def test_get_random_word_endpoint(client):
    """Test the V2 random word endpoint."""
    # Test with an existing module
    response = client.get('/v2/words/hiragana/random')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify it's a single word (not a list)
    assert isinstance(data, dict)
    assert 'id' in data
    assert 'kanji' in data
    assert 'hiragana' in data
    assert 'english' in data
    assert 'type' in data
    
    # Verify the word structure matches the regular endpoint
    word = data
    assert isinstance(word['id'], str)
    assert isinstance(word['kanji'], str)
    assert isinstance(word['hiragana'], str)
    assert isinstance(word['english'], str)
    assert isinstance(word['type'], str)

def test_get_random_word_nonexistent_module(client):
    """Test the V2 random word endpoint with a nonexistent module."""
    response = client.get('/v2/words/nonexistent/random')
    assert response.status_code == 404

def test_random_word_consistency(client):
    """Test that random word endpoint returns valid data from the module."""
    # Get all words from a module
    response = client.get('/v2/words/verbs')
    assert response.status_code == 200
    all_words_data = json.loads(response.data)
    
    if all_words_data['words']:
        all_word_ids = {word['id'] for word in all_words_data['words']}
        
        # Get a random word multiple times to ensure it's from the same module
        for _ in range(5):
            response = client.get('/v2/words/verbs/random')
            assert response.status_code == 200
            random_word_data = json.loads(response.data)
            
            # Verify the random word is from the same module
            assert random_word_data['id'] in all_word_ids

def test_random_word_queue_behavior(client):
    """Test that random word endpoint uses queue to avoid immediate repeats."""
    # Get all words from a module
    response = client.get('/v2/words/hiragana')
    assert response.status_code == 200
    all_words_data = json.loads(response.data)
    
    if len(all_words_data['words']) >= 3:
        # Get multiple random words and verify no immediate repeats
        seen_words = set()
        for _ in range(min(3, len(all_words_data['words']))):
            response = client.get('/v2/words/hiragana/random')
            assert response.status_code == 200
            random_word_data = json.loads(response.data)
            
            # Verify no immediate repeat (within first few calls)
            assert random_word_data['id'] not in seen_words
            seen_words.add(random_word_data['id'])

def test_random_word_queue_exhaustion(client):
    """Test that queue refills when exhausted."""
    # Get all words from a module
    response = client.get('/v2/words/hiragana')
    assert response.status_code == 200
    all_words_data = json.loads(response.data)
    
    if len(all_words_data['words']) >= 2:
        # Get all words from the module to exhaust the queue
        all_word_ids = set()
        for _ in range(len(all_words_data['words'])):
            response = client.get('/v2/words/hiragana/random')
            assert response.status_code == 200
            random_word_data = json.loads(response.data)
            all_word_ids.add(random_word_data['id'])
        
        # Verify we got all unique words (queue was exhausted)
        assert len(all_word_ids) == len(all_words_data['words'])
        
        # Get one more word - should refill queue and work
        response = client.get('/v2/words/hiragana/random')
        assert response.status_code == 200
        random_word_data = json.loads(response.data)
        assert 'id' in random_word_data
