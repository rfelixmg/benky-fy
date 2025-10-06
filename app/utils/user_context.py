from flask import g
from ..models.user import User
from ..database import db

def get_current_user():
    """Get or create current user from JWT payload."""
    if not hasattr(g, 'user'):
        return None
    
    jwt_payload = g.user
    auth0_id = jwt_payload.get('sub')
    
    if not auth0_id:
        return None
    
    # Try to find existing user
    user = User.query.filter_by(auth0_id=auth0_id).first()
    
    if not user:
        # Create new user from JWT payload
        user = User(
            auth0_id=auth0_id,
            email=jwt_payload.get('email', ''),
            name=jwt_payload.get('name', ''),
            picture=jwt_payload.get('picture'),
            provider=jwt_payload.get('provider', 'auth0')
        )
        db.session.add(user)
        db.session.commit()
    
    return user

def get_user_from_token(token):
    """Get user from JWT token without decorator."""
    from ..middleware.auth import verify_jwt_token
    
    payload = verify_jwt_token(token)
    if not payload:
        return None
    
    auth0_id = payload.get('sub')
    if not auth0_id:
        return None
    
    return User.query.filter_by(auth0_id=auth0_id).first()
