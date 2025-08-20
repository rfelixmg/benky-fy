import csv
import random
from dataclasses import dataclass
from typing import Optional, Tuple

from flask import Blueprint, render_template, request


module1_bp = Blueprint("module1", __name__)


@dataclass
class FlashcardItem:
	kanji: str
	hiragana: str
	katakana: str
	english: str
	prompt: str
	answer: str
	prompt_script: str  # e.g., hiragana, katakana, kanji, romaji, english
	answer_script: str

def load_flashcards_from_csv(path: str) -> list[FlashcardItem]:
    flashcards = []
    with open(path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
			# FlashcardItem(prompt="あ", answer="a", prompt_script="hiragana", answer_script="romaji"),
            item = FlashcardItem(
                kanji=row["Kanji"],
                hiragana=row["Hiragana"],
                katakana=row["Katakana"],
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


	def get_next(self) -> FlashcardItem:
		# Placeholder: returns first for now
		return self._data[random.randint(0, len(self._data))]

	def check_answer(self, user_input: str, item: FlashcardItem) -> Tuple[bool, str]:
		# Placeholder comparison (case-insensitive)
		is_correct = user_input.strip().lower() == item.answer.lower()
		return is_correct, item.answer


engine = FlashcardEngine()


@module1_bp.route("/", methods=["GET"])  # /module1/
def module1_index():
	item = engine.get_next()
	return render_template("module1.html", item=item, result=None)


@module1_bp.route("/check", methods=["POST"])  # /module1/check
def module1_check():
	item = engine.get_next()
	user_input: Optional[str] = request.form.get("user_input")
	is_correct, correct_answer = engine.check_answer(user_input or "", item)
	result = {
		"is_correct": is_correct,
		"correct_answer": correct_answer,
		"user_input": user_input,
	}
	return render_template("module1.html", item=item, result=result)


