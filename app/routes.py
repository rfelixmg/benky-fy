from flask import Blueprint, render_template, session, url_for
from app.auth import login_required, get_current_user, is_authenticated


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
	"""Public landing page"""
	return render_template("landing.html")

@main_bp.route("/home")
@login_required
def home():
	"""Private dashboard after login"""
	user = get_current_user()
	greeting = f"Hello, {user['name']}!"
	return render_template("home.html", user=user, greeting=greeting)

@main_bp.route("/modules")
@login_required
def modules():
	user = get_current_user()
	return render_template("modules.html", user=user)

@main_bp.route("/begginer")
@login_required
def begginers():
	user = get_current_user()
	# This route now shows available flashcard modules
	return render_template("flashcards.html", user=user)


"""Auth routes live in auth blueprint. No local /login here."""


