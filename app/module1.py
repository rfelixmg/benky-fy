import csv
import random
from dataclasses import dataclass
from typing import Optional, Tuple, List

from flask import Blueprint, render_template, request, session, redirect, url_for


module1_bp = Blueprint("module1", __name__)


@dataclass
class FlashcardItem:
	index: int
	kanji: str
	hiragana: str
	katakana: str
	romaji: str
	english: str
	prompt: str
	answer: str
	prompt_script: str  # e.g., hiragana, katakana, kanji, romaji, english
	answer_script: str

def load_flashcards_from_csv(path: str) -> list[FlashcardItem]:
    flashcards = []
    with open(path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for idx, row in enumerate(reader):
			# FlashcardItem(prompt="あ", answer="a", prompt_script="hiragana", answer_script="romaji"),
            item = FlashcardItem(
				index=idx,
                kanji=row["Kanji"],
                hiragana=row["Hiragana"],
                katakana=row["Katakana"],
                romaji=row["Romaji"],
                english=row["English"],
                prompt=row["Hiragana"],          # default prompt
                answer=row["English"],           # default answer
                prompt_script="hiragana",        # default script
                answer_script="english"
            )
            flashcards.append(item)
    return flashcards


class FlashcardEngine:
	"""Placeholder OOP class for future flashcard logic."""

	def __init__(self, filename: str = "./datum/verbs.csv") -> None:
		import os
		print(os.getcwd())
		self._data = load_flashcards_from_csv(filename)


	def __getitem__(self, index: int) -> FlashcardItem:
		return self._data[index]

	def get_next(self, flashcard_styles: List[str] = None) -> FlashcardItem:
		"""Get next flashcard with specified prompt style(s)"""
		if not flashcard_styles:
			flashcard_styles = ["hiragana"]  # default
		
		# Get random card
		item = self._data[random.randint(0, len(self._data) - 1)]
		
		# Set prompt based on selected style
		selected_style = random.choice(flashcard_styles)
		
		if selected_style == "hiragana":
			item.prompt = item.hiragana
			item.prompt_script = "hiragana"
		elif selected_style == "kanji":
			item.prompt = item.kanji
			item.prompt_script = "kanji"
		elif selected_style == "katakana":
			item.prompt = item.katakana
			item.prompt_script = "katakana"
		elif selected_style == "english":
			item.prompt = item.english
			item.prompt_script = "english"
		
		return item

	def check_answers(self, user_inputs: dict, item: FlashcardItem, checking_styles: List[str]) -> dict:
		"""Check multiple answers against different checking styles"""
		results = {}
		
		for style in checking_styles:
			user_input = user_inputs.get(f"user_{style}", "").strip().lower()
			
			if style == "hiragana":
				correct_answer = item.hiragana.lower()
			elif style == "kanji":
				correct_answer = item.kanji.lower()
			elif style == "katakana":
				correct_answer = item.katakana.lower()
			elif style == "english":
				correct_answer = item.english.lower()
			elif style == "romaji":
				correct_answer = item.romaji.lower() if item.romaji else item.hiragana.lower()  # fallback
			else:
				correct_answer = ""
			
			is_correct = user_input == correct_answer if user_input else False
			results[style] = {
				"user_input": user_inputs.get(f"user_{style}", ""),
				"correct_answer": correct_answer,
				"is_correct": is_correct
			}
		
		return results


engine = FlashcardEngine()


def get_default_settings():
	"""Get default settings for flashcards"""
	return {
		"flashcard_styles": ["hiragana"],
		"checking_styles": ["english"]
	}

def get_user_settings():
	"""Get user settings from session with defaults"""
	return session.get("settings", get_default_settings())

@module1_bp.route("/", methods=["GET"])  # /module1/
def module1_index():
	settings = get_user_settings()
	item = engine.get_next(settings["flashcard_styles"])
	return render_template("module1.html", item=item, results=None, settings=settings)

@module1_bp.route("/settings", methods=["POST"])  # /module1/settings
def update_settings():
	"""Update user settings"""
	# Get flashcard styles
	flashcard_styles = []
	for style in ["hiragana", "kanji", "katakana", "english"]:
		if request.form.get(f"flashcard_{style}"):
			flashcard_styles.append(style)
	
	# Get checking styles
	checking_styles = []
	for style in ["hiragana", "kanji", "katakana", "english", "romaji"]:
		if request.form.get(f"checking_{style}"):
			checking_styles.append(style)
	
	# Ensure at least one option is selected
	if not flashcard_styles:
		flashcard_styles = ["hiragana"]
	if not checking_styles:
		checking_styles = ["english"]
	
	session["settings"] = {
		"flashcard_styles": flashcard_styles,
		"checking_styles": checking_styles
	}
	
	return redirect(url_for("module1.module1_index"))

@module1_bp.route("/check", methods=["POST"])  # /module1/check
def module1_check():
	item = engine[int(request.form["item_id"])]
	settings = get_user_settings()
	
	# Collect user inputs for all checking styles
	user_inputs = {}
	for style in settings["checking_styles"]:
		user_inputs[f"user_{style}"] = request.form.get(f"user_{style}", "")
	
	results = engine.check_answers(user_inputs, item, settings["checking_styles"])
	
	# Check if all answers are correct
	all_correct = all(result["is_correct"] for result in results.values())
	
	return render_template("module1.html", item=item, results=results, all_correct=all_correct, settings=settings)


