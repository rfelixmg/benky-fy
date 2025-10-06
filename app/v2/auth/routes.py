from flask_restx import Api, Resource, fields
from flask import Blueprint, session
from ...middleware.auth import require_auth
from ...utils.user_context import get_current_user
import json

# Create API blueprint
bp = Blueprint('v2_auth_api', __name__)
api = Api(bp, 
          title='Benky-Fy V2 Auth API',
          version='2.0',
          description='''
# Benky-Fy V2 Auth API

## Overview
JWT-based authentication with Auth0 integration. Auto-creates users in database.

## How to Use
1. **Check auth**: GET `/v2/auth/me` - Returns current user info (requires JWT)
2. **Session fallback**: GET `/v2/auth/check-auth` - Returns session-based auth status

## Authentication
- **JWT Required**: Include `Authorization: Bearer <token>` header
- **Auto User Creation**: Users created automatically from JWT payload
- **Database Integration**: User data stored in PostgreSQL

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

user_info_model = api.model('UserInfo', {
    'id': fields.Integer(description='User ID'),
    'email': fields.String(description='User email'),
    'name': fields.String(description='User name'),
    'picture': fields.String(description='User picture URL'),
    'provider': fields.String(description='Auth provider'),
    'created_at': fields.String(description='Account creation date'),
    'is_active': fields.Boolean(description='Account status')
})

jwt_auth_response_model = api.model('JWTAuthResponse', {
    'authenticated': fields.Boolean(description='Authentication status'),
    'user': fields.Nested(user_info_model, description='User information')
})

@api.route('/auth/me')
class JWTAuthResource(Resource):
    @api.doc('get_current_user', 
             description='Get current user info from JWT token',
             responses={
                 200: 'Success - Returns user information',
                 401: 'Unauthorized - Invalid or missing token'
             })
    @api.marshal_with(jwt_auth_response_model)
    @require_auth
    def get(self):
        """Get current user information from JWT token."""
        user = get_current_user()
        
        if not user:
            return {'authenticated': False, 'user': None}, 401
        
        return {
            'authenticated': True,
            'user': user.to_dict()
        }

@api.route('/auth/check-auth')
class AuthResource(Resource):
    @api.doc('check_auth', 
             description='Check authentication status (session-based)',
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
