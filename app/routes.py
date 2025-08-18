from flask import Blueprint, render_template


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
	if True: #not current_user.is_authenticated:
		return login()
	return home()

@main_bp.route("/home")
def home():
	return render_template("home.html")


@main_bp.route("/login")
def login():
	return render_template("login.html")


