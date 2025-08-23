from flask import Blueprint, redirect, url_for, session, request, flash, render_template
from flask_dance.contrib.google import google
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
	# Start Google OAuth flow via Flask-Dance's google blueprint
	if not google.authorized:
		return redirect(url_for("google.login"))
	return redirect(url_for("auth.post_login"))


@auth_bp.route("/post-login")
def post_login():
	# Fetch user profile from Google and store minimal info in session
	if not google.authorized:
		return redirect(url_for("auth.login"))

	response = google.get("/oauth2/v2/userinfo")
	if not response.ok:
		return redirect(url_for("auth.login"))

	profile = response.json() or {}
	user_name = profile.get("name") or profile.get("given_name") or "User"
	user_email = profile.get("email")
	user_picture = profile.get("picture")

	session["user"] = {
		"name": user_name,
		"email": user_email,
		"picture": user_picture,
	}

	# Redirect to originally requested URL or home
	next_url = session.pop('next_url', None)
	if next_url:
		return redirect(next_url)
	return redirect(url_for("main.home"))


@auth_bp.route("/logout")
def logout():
	# Clear session to log out
	session.clear()
	return redirect(url_for("main.home"))


@auth_bp.route("/debug-oauth")
def debug_oauth():
	"""Debug endpoint to see OAuth configuration"""
	from flask_dance.contrib.google import google
	
	debug_info = {
		"google_authorized": google.authorized,
		"google_oauth_url": url_for("google.login"),
		"google_authorized_url": url_for("google.authorized"),
		"current_url": request.url,
		"base_url": request.base_url,
		"host": request.host,
		"scheme": request.scheme,
	}
	
	return debug_info



