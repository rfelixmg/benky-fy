from flask import Blueprint, redirect, url_for, session
from flask_dance.contrib.google import google


auth_bp = Blueprint("auth", __name__)


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

	return redirect(url_for("main.home"))


@auth_bp.route("/logout")
def logout():
	# Clear session to log out
	session.clear()
	return redirect(url_for("main.home"))



