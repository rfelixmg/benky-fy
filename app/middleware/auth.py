import jwt
import requests
from functools import wraps
from flask import request, jsonify, g
import os

def verify_jwt_token(token):
    """Verify JWT token from Auth0."""
    if token.startswith('Bearer '):
        token = token[7:]
    
    try:
        # Get token header to find key ID
        header = jwt.get_unverified_header(token)
        kid = header['kid']
        
        # Get JWKS from Auth0
        jwks_url = f"https://{os.getenv('AUTH0_DOMAIN')}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()
        
        # Find the correct key
        key = None
        for jwk in jwks['keys']:
            if jwk['kid'] == kid:
                key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                break
        
        if not key:
            return None
        
        # Verify and decode token
        payload = jwt.decode(
            token, 
            key, 
            algorithms=['RS256'],
            audience=os.getenv('AUTH0_AUDIENCE'),
            issuer=f"https://{os.getenv('AUTH0_DOMAIN')}/"
        )
        return payload
        
    except Exception as e:
        print(f"JWT verification error: {e}")
        return None

def require_auth(f):
    """Decorator to require JWT authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        g.user = payload
        return f(*args, **kwargs)
    return decorated_function
