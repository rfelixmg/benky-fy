from flask import Blueprint, render_template, session, url_for
from app.auth import login_required, get_current_user, is_authenticated


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
	"""Public landing page"""
	return render_template("landing/landing.html")

@main_bp.route("/home")
@login_required
def home():
	"""Private dashboard after login"""
	user = get_current_user()
	greeting = f"Hello, {user['name']}!"
	return render_template("pages/home.html", user=user, greeting=greeting)

@main_bp.route("/modules")
@login_required
def modules():
	user = get_current_user()
	return render_template("pages/modules.html", user=user)

@main_bp.route("/profile")
@login_required
def profile():
	user = get_current_user()
	
	# Create mock profile data for testing/demo
	profile_data = {
		"level": "Beginner",
		"join_date": "2024-01-15",
		"total_study_time": "45 hours",
		"streak": 7,
		"achievements": [
			"First Steps",
			"Week Warrior", 
			"Hiragana Master"
		],
		"preferences": {
			"daily_goal": "30 minutes",
			"notifications": "Enabled",
			"theme": "Light"
		}
	}
	
	return render_template("pages/profile.html", user=user, profile=profile_data)

@main_bp.route("/begginer")
@login_required
def begginers():
	user = get_current_user()
	# This route now shows available flashcard modules
	return render_template("flashcards.html", user=user)


"""Auth routes live in auth blueprint. No local /login here."""


