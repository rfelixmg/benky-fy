from flask import Blueprint, redirect, url_for, session, request, flash, render_template
from flask_dance.contrib.google import google
from flask_dance.consumer import oauth_authorized
from functools import wraps
import os
import hashlib


auth_bp = Blueprint("auth", __name__)


def is_test_mode():
	"""Check if we're in test mode based on environment variable and dummy context."""
	test_hash = os.environ.get('BENKY_FY_TEST_HASH')
	if not test_hash:
		return False, None
	
	# Expected hash for test mode (you can change this secret)
	expected_hash = hashlib.sha256(b'benky-fy-test-mode-2024').hexdigest()
	if test_hash != expected_hash:
		return False, None
	
	try:
		dummy_context = session.get('test_dummy_context')
		return True, dummy_context
	except RuntimeError:
		return False, None


def get_dummy_context():
	"""Get dummy context for test modules."""
	return {
		"test_modules": {
			"hiragana": {"enabled": True, "data_source": "test"},
			"katakana": {"enabled": True, "data_source": "test"},
			"verbs": {"enabled": True, "data_source": "test"},
			"adjectives": {"enabled": True, "data_source": "test"},
			"numbers_basic": {"enabled": True, "data_source": "test"},
			"vocab": {"enabled": True, "data_source": "test"}
		},
		"test_user_context": {
			"session_id": "test_session_12345",
			"test_mode": True,
			"bypass_oauth": True
		}
	}


def setup_test_context():
	"""Set up test context in session for test mode."""
	dummy_context = get_dummy_context()
	session['test_dummy_context'] = dummy_context
	session.permanent = True
	session.modified = True
	return dummy_context


def clear_test_context():
	"""Clear test context from session."""
	if 'test_dummy_context' in session:
		del session['test_dummy_context']
		session.modified = True


def get_test_user():
	"""Get test user data for test mode."""
	return {
		"name": "Test User",
		"email": "test@benky-fy.com",
		"picture": "https://via.placeholder.com/150/4285f4/ffffff?text=T",
		"is_test_user": True
	}


def login_required(f):
	"""Decorator to require authentication for a route."""
	@wraps(f)
	def decorated_function(*args, **kwargs):
		# Check if we're in test mode first - now requires both env var AND dummy context
		test_mode, dummy_context = is_test_mode()
		
		if test_mode and dummy_context:
			# Set test user in session if not already set
			if 'user' not in session:
				session['user'] = get_test_user()
				session.permanent = True
				session.modified = True
			return f(*args, **kwargs)
		
		# If we're in test mode but don't have dummy context, redirect to login
		if test_mode and not dummy_context:
			session['next_url'] = request.url
			flash('Test mode requires dummy context. Please log in.', 'info')
			return redirect(url_for('auth.login'))
		
		# Normal authentication flow - check if user is already authenticated
		if 'user' in session and session['user'] is not None:
			# User is authenticated, allow access
			return f(*args, **kwargs)
		
		# User is not authenticated, redirect to login
		session['next_url'] = request.url
		flash('Please log in to access this page.', 'info')
		return redirect(url_for('auth.login'))
	return decorated_function


def get_current_user():
	"""Helper function to get current user from session."""
	return session.get('user')


def is_authenticated():
	"""Helper function to check if user is authenticated."""
	return 'user' in session and session['user'] is not None


@auth_bp.route("/login")
def login():
	"""Login route that handles the complete OAuth flow"""
	
	# If user is already logged in, redirect to home
	if 'user' in session:
		return redirect(url_for("main.home"))
	
	# Check if Google OAuth is authorized
	if not google.authorized:
		print("Google not authorized, starting OAuth flow")
		# Start the OAuth flow - this will redirect to Google
		return redirect(url_for("google.login"))
	
	# Google is authorized, fetch user info and complete login
	print("Google authorized, fetching user info and completing login")
	try:
		response = google.get("/oauth2/v2/userinfo")
	except Exception as e:
		print(f"Error fetching user info: {e}")
		# Token might be expired or invalid, clear session and restart OAuth
		session.clear()
		return redirect(url_for("google.login"))
	
	if not response.ok:
		print(f"Failed to get user info: {response.status_code}")
		session.clear()  # Clear any partial session data
		# Try OAuth flow again
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

	# Always redirect to /home after successful login
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
	
	# Don't store the token since we're using session-based auth
	return False


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


# New pseudo-pages
@auth_bp.route("/profile")
@login_required
def profile():
	"""User profile page with dummy data"""
	user = get_current_user()
	
	# Dummy profile data
	dummy_profile = {
		"name": user["name"],
		"email": user["email"],
		"join_date": "January 2025",
		"level": "Beginner",
		"total_study_time": "12 hours",
		"streak": "5 days",
		"achievements": ["First Login", "Completed Hiragana", "7-Day Streak"],
		"preferences": {
			"daily_goal": "30 minutes",
			"notifications": "Enabled",
			"theme": "Default"
		}
	}
	
	return render_template("pages/profile.html", user=user, profile=dummy_profile)


@auth_bp.route("/dashboard")
@login_required
def dashboard():
	"""User dashboard with dummy progress data"""
	user = get_current_user()
	
	# Dummy dashboard data
	dummy_dashboard = {
		"today_progress": {
			"cards_reviewed": 25,
			"time_studied": "45 minutes",
			"streak_maintained": True
		},
		"weekly_stats": {
			"total_cards": 150,
			"accuracy": "87%",
			"streak": "5 days"
		},
		"recent_activity": [
			{"type": "Hiragana", "action": "Reviewed あ-お", "time": "2 hours ago"},
			{"type": "Katakana", "action": "Learned カ-コ", "time": "1 day ago"},
			{"type": "Vocabulary", "action": "Mastered 10 words", "time": "3 days ago"}
		],
		"next_goals": [
			"Complete Hiragana basics",
			"Start Katakana learning",
			"Build 100-word vocabulary"
		]
	}
	
	return render_template("pages/dashboard.html", user=user, dashboard=dummy_dashboard)


@auth_bp.route("/settings")
@login_required
def settings():
	"""User settings page with dummy options"""
	user = get_current_user()
	
	# Dummy settings data
	dummy_settings = {
		"account": {
			"email": user["email"],
			"timezone": "UTC-5",
			"language": "English"
		},
		"study": {
			"daily_goal": "30 minutes",
			"difficulty": "Beginner",
			"auto_advance": True,
			"sound_enabled": True
		},
		"notifications": {
			"daily_reminder": True,
			"streak_alerts": True,
			"achievement_notifications": True,
			"email_updates": False
		},
		"privacy": {
			"profile_public": False,
			"show_progress": True,
			"allow_friend_requests": False
		}
	}
	
	return render_template("pages/settings.html", user=user, settings=dummy_settings)


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



