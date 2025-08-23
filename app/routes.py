from flask import Blueprint, render_template, session, url_for
from app.auth import login_required, get_current_user, is_authenticated


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
	return home()

@main_bp.route("/home")
def home():
	user = session.get("user")
	greeting = f"Hello, {user['name']}!" if user else "Hello, Guest. Please log in."
	return render_template("home.html", user=user, greeting=greeting)

@main_bp.route("/modules")
@login_required
def modules():
	user = get_current_user()
	return render_template("modules.html", user=user)


"""Auth routes live in auth blueprint. No local /login here."""


