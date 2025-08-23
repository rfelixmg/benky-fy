from flask import Blueprint, redirect, url_for, session, request, flash, render_template
from flask_dance.contrib.google import google
from flask_dance.consumer import oauth_authorized
from functools import wraps


auth_bp = Blueprint("auth", __name__)


def login_required(f):
	"""Decorator to require authentication for a route."""
	@wraps(f)
	def decorated_function(*args, **kwargs):
		if 'user' not in session:
			# Store the URL they were trying to access
			session['next_url'] = request.url
			flash('Please log in to access this page.', 'info')
			return redirect(url_for('auth.login'))
		return f(*args, **kwargs)
	return decorated_function


def get_current_user():
	"""Helper function to get current user from session."""
	return session.get('user')


def is_authenticated():
	"""Helper function to check if user is authenticated."""
	return 'user' in session and session['user'] is not None


@auth_bp.route("/login")
def login():
	"""Login route that handles both initial login and post-OAuth callback"""
	# Check if Google OAuth is authorized
	if not google.authorized:
		print("Google not authorized, redirecting to Google login")
		return redirect(url_for("google.login"))
	
	# Google is authorized, fetch user info
	print("Google authorized, fetching user info")
	response = google.get("/oauth2/v2/userinfo")
	
	if not response.ok:
		print(f"Failed to get user info: {response.status_code}")
		session.clear()  # Clear any partial session data
		return redirect(url_for("google.login"))

	profile = response.json()
	print(f"Got user profile: {profile}")
	
	user_name = profile.get("name") or profile.get("given_name") or "User"
	user_email = profile.get("email")
	user_picture = profile.get("picture")

	# Store user info in session
	session["user"] = {
		"name": user_name,
		"email": user_email,
		"picture": user_picture,
	}
	
	# Force session to be saved
	session.permanent = True
	session.modified = True
	
	print(f"User session created: {session['user']}")

	# Always redirect to /home after successful login (unless there's a specific next_url)
	next_url = session.pop('next_url', None)
	if next_url and next_url != url_for('main.index'):  # Don't redirect back to landing page
		return redirect(next_url)
	return redirect(url_for("main.home"))


# OAuth callback handler - this will fire after Google redirects back
@oauth_authorized.connect_via(google)
def google_logged_in(blueprint, token):
	"""Called when Google OAuth login is completed"""
	print(f"OAuth callback fired! Token: {token is not None}")
	
	if not token:
		print("No token received")
		flash("Failed to log in with Google.", category="error")
		return False

	# Fetch user profile from Google
	response = blueprint.session.get("/oauth2/v2/userinfo")
	if not response.ok:
		print(f"Failed to get user info in callback: {response.status_code}")
		flash("Failed to fetch user info from Google.", category="error")
		return False

	profile = response.json()
	print(f"OAuth callback got profile: {profile}")
	
	user_name = profile.get("name") or profile.get("given_name") or "User"
	user_email = profile.get("email")
	user_picture = profile.get("picture")

	# Store user info in Flask session
	session["user"] = {
		"name": user_name,
		"email": user_email,
		"picture": user_picture,
	}
	
	# Force session to be saved
	session.permanent = True
	session.modified = True
	
	print(f"OAuth callback set session: {session['user']}")
	
	flash(f"Successfully logged in as {user_name}!", category="success")
	
	# IMPORTANT: Return a redirect response to /home
	from flask import redirect, url_for
	return redirect(url_for("main.home"))


@auth_bp.route("/post-login")
def post_login():
	"""Legacy route for compatibility - now redirects to home"""
	if not google.authorized:
		return redirect(url_for("auth.login"))

	# Always redirect to home after OAuth completion
	return redirect(url_for("main.home"))


@auth_bp.route("/logout")
def logout():
	# Clear session to log out
	session.clear()
	flash("You have been logged out.", category="info")
	return redirect(url_for("main.index"))  # Redirect to landing page after logout


@auth_bp.route("/check-auth")
def check_auth():
	"""API endpoint to check if user is authenticated"""
	return {
		"authenticated": is_authenticated(),
		"user": get_current_user(),
		"session_keys": list(session.keys()),
		"google_authorized": google.authorized if google else False
	}


@auth_bp.route("/debug-oauth")
def debug_oauth():
	"""Debug endpoint to see OAuth configuration"""
	debug_info = {
		"google_authorized": google.authorized if google else False,
		"google_oauth_url": url_for("google.login") if google else None,
		"current_url": request.url,
		"session_user": session.get("user"),
		"session_keys": list(session.keys()),
		"has_google": google is not None,
	}
	
	if google and google.authorized:
		try:
			response = google.get("/oauth2/v2/userinfo")
			debug_info["google_response_ok"] = response.ok
			if response.ok:
				debug_info["google_profile"] = response.json()
		except Exception as e:
			debug_info["google_error"] = str(e)
	
	return debug_info



