from flask import Blueprint, render_template, session, url_for


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
	return home()

@main_bp.route("/home")
def home():
	user = session.get("user")
	greeting = f"Hello, {user['name']}!" if user else "Hello, Guest. Please log in."
	return render_template("home.html", user=user, greeting=greeting)


"""Auth routes live in auth blueprint. No local /login here."""


