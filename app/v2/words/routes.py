from flask import Blueprint, jsonify
import json
import os
import uuid

bp = Blueprint('v2_words', __name__)

def _load_module_data(module_name: str) -> list:
    """Load word data from JSON file."""
    file_path = f"./datum/{module_name}.json"
    if not os.path.exists(file_path):
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

@bp.route("/v2/words/<module>")
def get_words(module):
    """Return list of words for a module."""
    words = _load_module_data(module)
    
    # Transform data to V2 format
    formatted_words = [{
        "id": str(uuid.uuid4()),  # Generate unique ID for each word
        "kanji": word.get("kanji", ""),
        "hiragana": word.get("hiragana", ""),
        "english": word.get("english", ""),
        "type": word.get("type", "noun")  # Default to noun if type not specified
    } for word in words]
    
    return jsonify({"words": formatted_words})
