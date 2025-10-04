import os
import json
from flask_restx import Api, Resource, fields
from flask import Blueprint, request
from typing import Dict, List, Any

bp = Blueprint('v2_validation_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Validation API',
          version='2.0',
          description='Validation endpoints for Japanese character input',
          doc='/v2/validation/docs/',
          prefix='/v2')

# Define models for API documentation
stroke_data_model = api.model('StrokeData', {
    'strokes': fields.List(fields.List(fields.Integer), description='Stroke coordinates'),
    'timing': fields.List(fields.Float, description='Stroke timing in milliseconds'),
})

validation_request_model = api.model('ValidationRequest', {
    'character': fields.String(description='Character to validate'),
    'input': fields.String(description='User input'),
    'stroke_data': fields.Nested(stroke_data_model),
})

validation_response_model = api.model('ValidationResponse', {
    'is_correct': fields.Boolean(description='Whether the input is correct'),
    'feedback': fields.List(fields.String, description='Detailed feedback per stroke'),
    'correct_strokes': fields.List(fields.List(fields.Integer), description='Correct stroke coordinates'),
})

# Load stroke data
def load_stroke_data() -> Dict[str, Any]:
    file_path = "./datum/stroke_data.json"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading stroke_data.json: {e}")
        return {}

def validate_strokes(character: str, stroke_data: Dict[str, Any], reference_data: Dict[str, Any]) -> List[str]:
    """Validate stroke order and direction."""
    feedback = []
    ref_strokes = reference_data.get(character, {}).get('strokes', [])
    
    if not ref_strokes:
        return ['Character data not found']
    
    user_strokes = stroke_data.get('strokes', [])
    
    # Check stroke count
    if len(user_strokes) != len(ref_strokes):
        feedback.append(f'Expected {len(ref_strokes)} strokes, got {len(user_strokes)}')
        return feedback
    
    # Check each stroke
    for i, (user_stroke, ref_stroke) in enumerate(zip(user_strokes, ref_strokes)):
        # Check direction
        user_direction = calculate_direction(user_stroke)
        ref_direction = calculate_direction(ref_stroke)
        
        if user_direction != ref_direction:
            feedback.append(f'Stroke {i+1}: Incorrect direction')
        
        # Check length
        user_length = calculate_length(user_stroke)
        ref_length = calculate_length(ref_stroke)
        
        if abs(user_length - ref_length) > 0.2 * ref_length:
            feedback.append(f'Stroke {i+1}: Incorrect length')
    
    if not feedback:
        feedback.append('All strokes correct')
    
    return feedback

def calculate_direction(stroke: List[List[int]]) -> float:
    """Calculate overall stroke direction."""
    if len(stroke) < 2:
        return 0
    start, end = stroke[0], stroke[-1]
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    return (dx, dy)

def calculate_length(stroke: List[List[int]]) -> float:
    """Calculate stroke length."""
    length = 0
    for i in range(len(stroke) - 1):
        dx = stroke[i+1][0] - stroke[i][0]
        dy = stroke[i+1][1] - stroke[i][1]
        length += (dx*dx + dy*dy) ** 0.5
    return length

@api.route('/validation/stroke-order')
class StrokeOrderValidation(Resource):
    @api.doc('validate_stroke_order',
             description='Validate stroke order and provide feedback',
             body=validation_request_model,
             responses={
                 200: 'Success',
                 400: 'Invalid request',
                 404: 'Character data not found'
             })
    @api.marshal_with(validation_response_model)
    def post(self):
        """Validate stroke order and provide feedback."""
        data = request.get_json()
        character = data.get('character')
        stroke_data = data.get('stroke_data', {})
        
        if not character or not stroke_data:
            api.abort(400, "Missing character or stroke data")
        
        reference_data = load_stroke_data()
        feedback = validate_strokes(character, stroke_data, reference_data)
        
        return {
            'is_correct': feedback == ['All strokes correct'],
            'feedback': feedback,
            'correct_strokes': reference_data.get(character, {}).get('strokes', [])
        }

@api.route('/validation/input')
class InputValidation(Resource):
    @api.doc('validate_input',
             description='Validate user input against expected character',
             body=validation_request_model,
             responses={
                 200: 'Success',
                 400: 'Invalid request'
             })
    def post(self):
        """Validate user input and provide feedback."""
        data = request.get_json()
        character = data.get('character')
        user_input = data.get('input')
        
        if not character or not user_input:
            api.abort(400, "Missing character or input")
        
        # Convert romaji to hiragana if needed
        from ..common.romaji_conversion import convert_to_hiragana
        normalized_input = convert_to_hiragana(user_input)
        
        return {
            'is_correct': normalized_input == character,
            'feedback': ['Input matches expected character'] if normalized_input == character else ['Incorrect input'],
            'normalized_input': normalized_input
        }
