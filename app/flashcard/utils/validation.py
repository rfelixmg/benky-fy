"""Validation utilities for flashcard functionality."""


def all_correct_logic(results: dict) -> bool:
    """Helper function to determine if all non-skipped answers are correct"""
    non_skipped_results = [result for result in results.values() if not result.get("skipped", False)]
    if not non_skipped_results:
        return False  # All fields empty
    else:
        return all(result.get("is_correct", False) for result in non_skipped_results)
