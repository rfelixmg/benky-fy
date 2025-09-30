from flask_restx import Api, Resource, fields
from flask import Blueprint, session
import json

# Create API blueprint
bp = Blueprint('v2_auth_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Auth API',
          version='2.0',
          description='''
# Benky-Fy V2 Auth API

## Overview
Session-based authentication status checking for V2 API compatibility.

## How to Use
1. **Check auth**: GET `/v2/auth/check-auth` - Returns authentication status
2. **Session support**: Uses Flask session for compatibility with V1 auth system

## Response Format
Pure JSON with authentication status and user information.
          ''',
          doc='/v2/auth/docs/',
          prefix='/v2')

# Define models for API documentation
auth_response_model = api.model('AuthResponse', {
    'authenticated': fields.Boolean(description='Authentication status'),
    'user': fields.Raw(description='User information if authenticated'),
    'session_keys': fields.List(fields.String, description='Session keys'),
    'google_authorized': fields.Boolean(description='Google OAuth status')
})

@api.route('/auth/check-auth')
class AuthResource(Resource):
    @api.doc('check_auth', 
             description='Check authentication status',
             responses={
                 200: 'Success - Returns authentication status'
             })
    @api.marshal_with(auth_response_model)
    def get(self):
        """Check authentication status."""
        # Check if user is authenticated via session
        user_id = session.get('user_id')
        google_token = session.get('google_token')
        
        if user_id:
            return {
                'authenticated': True,
                'user': {
                    'id': user_id,
                    'name': session.get('user_name', ''),
                    'email': session.get('user_email', ''),
                    'picture': session.get('user_picture')
                },
                'session_keys': list(session.keys()),
                'google_authorized': bool(google_token)
            }
        else:
            return {
                'authenticated': False,
                'user': None,
                'session_keys': [],
                'google_authorized': False
            }
