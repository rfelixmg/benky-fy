"use client";

import { useState, useCallback, KeyboardEvent, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Furigana } from "./furigana";
import { JapaneseText } from "./furigana";
import { romajiToHiragana } from "@/core/romaji-conversion";
import {
  textStyles,
  formStyles,
  progressStyles,
  layoutStyles,
} from "@/styles/components";

interface Word {
  id: string;
  kanji: string;
  hiragana: string;
  english: string;
  type: "verb" | "noun" | "adjective";
}

interface PracticeInterfaceProps {
  words: Word[];
  onComplete: () => void;
  onProgress: (current: number, total: number) => void;
}

export function PracticeInterface({
  words,
  onComplete,
  onProgress,
}: PracticeInterfaceProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [showAnswer, setShowAnswer] = useState(false);

  const currentWord = words[currentIndex];

  const checkAnswer = useCallback((): void => {
    if (!currentWord) return;

    const normalizedInput = answer.trim().toLowerCase();
    const normalizedAnswer = currentWord.hiragana.toLowerCase();
    const romajiConverted = romajiToHiragana(normalizedInput).converted;

    const isCorrect =
      normalizedInput === normalizedAnswer ||
      romajiConverted === normalizedAnswer;

    if (isCorrect) {
      setFeedback("correct");
      setShowAnswer(false);

      // Move to next word after delay
      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setAnswer("");
          setFeedback(null);
          onProgress(currentIndex + 2, words.length);
        } else {
          onComplete();
        }
      }, 1000);
    } else {
      setFeedback("incorrect");
      setShowAnswer(true);
    }
  }, [answer, currentWord, currentIndex, words.length, onComplete, onProgress]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAnswer(e.target.value);
    setFeedback(null);
    setShowAnswer(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  if (words.length === 0) {
    return (
      <div className={`${textStyles.secondary} text-center p-4`}>
        No words available for practice
      </div>
    );
  }

  return (
    <div className={`${layoutStyles.col} ${layoutStyles.gap.lg}`}>
      {/* Progress */}
      <div className={progressStyles.bar.container}>
        <div
          className={progressStyles.bar.progress}
          style={{ width: `${(currentIndex / words.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={(currentIndex / words.length) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div
        className={`${layoutStyles.row} ${layoutStyles.between} ${layoutStyles.center}`}
      >
        <div className={textStyles.secondary}>
          {currentIndex + 1}/{words.length}
        </div>
        <div className={`${textStyles.sm} ${textStyles.tertiary} capitalize`}>
          {currentWord.type}
        </div>
      </div>

      {/* Word Display */}
      <Card
        variant="primary"
        className={`${layoutStyles.col} ${layoutStyles.center} ${layoutStyles.gap.md}`}
      >
        <div className={textStyles["2xl"]}>
          <Furigana
            kanji={currentWord.kanji}
            mode="ruby"
            showFurigana={false}
          />
        </div>
        <div className={textStyles.secondary}>{currentWord.english}</div>
      </Card>

      {/* Answer Input */}
      <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
        <div className={layoutStyles.row}>
          <input
            type="text"
            value={answer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className={`
              ${formStyles.input.base}
              ${formStyles.input.focus}
              ${feedback === "incorrect" && formStyles.input.error}
              flex-1
            `}
            placeholder="Enter your answer..."
            aria-label="Answer input"
          />
          <button
            onClick={checkAnswer}
            className={`
              ${formStyles.button.base}
              ${formStyles.button.primary}
              ml-2
            `}
          >
            Check
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`
              ${textStyles.sm}
              ${feedback === "correct" ? progressStyles.indicator.success : progressStyles.indicator.error}
            `}
          >
            {feedback === "correct" ? "Correct!" : "Incorrect, try again"}
          </div>
        )}

        {/* Show Answer */}
        {showAnswer && (
          <div className={`${textStyles.sm} ${textStyles.secondary}`}>
            Correct answer: <JapaneseText text={currentWord.hiragana} />
          </div>
        )}
      </div>
    </div>
  );
}
