"use client";

import { useState, useCallback } from "react";
import { StrokeCanvas } from "./StrokeCanvas";
import { textStyles, layoutStyles, formStyles } from "@/styles/components";

interface CharacterInputProps {
  character: string;
  onSubmit: (result: { isCorrect: boolean; feedback: string[] }) => void;
}

export function CharacterInput({
  character,
  onSubmit,
}: CharacterInputProps): JSX.Element {
  const [inputMethod, setInputMethod] = useState<"drawing" | "typing">(
    "drawing",
  );
  const [textInput, setTextInput] = useState("");
  const [feedback, setFeedback] = useState<string[]>([]);

  const validateStrokeOrder = useCallback(
    async (strokeData: { strokes: number[][]; timing: number[] }) => {
      try {
        const response = await fetch("/v2/validation/stroke-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            character,
            stroke_data: strokeData,
          }),
        });

        if (!response.ok) {
          throw new Error("Validation failed");
        }

        const result = await response.json();
        setFeedback(result.feedback);
        onSubmit({
          isCorrect: result.is_correct,
          feedback: result.feedback,
        });
      } catch (err) {
        setFeedback(["Error validating stroke order"]);
        onSubmit({
          isCorrect: false,
          feedback: ["Error validating stroke order"],
        });
      }
    },
    [character, onSubmit],
  );

  const validateTextInput = useCallback(async () => {
    try {
      const response = await fetch("/v2/validation/input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          character,
          input: textInput,
        }),
      });

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      const result = await response.json();
      setFeedback(result.feedback);
      onSubmit({
        isCorrect: result.is_correct,
        feedback: result.feedback,
      });
    } catch (err) {
      setFeedback(["Error validating input"]);
      onSubmit({
        isCorrect: false,
        feedback: ["Error validating input"],
      });
    }
  }, [character, textInput, onSubmit]);

  return (
    <div className={`${layoutStyles.col} ${layoutStyles.gap.md}`}>
      {/* Input Method Selection */}
      <div className={`${layoutStyles.row} ${layoutStyles.gap.sm}`}>
        <button
          onClick={() => setInputMethod("drawing")}
          className={`
            ${formStyles.button.base}
            ${inputMethod === "drawing" ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Draw
        </button>
        <button
          onClick={() => setInputMethod("typing")}
          className={`
            ${formStyles.button.base}
            ${inputMethod === "typing" ? formStyles.button.primary : formStyles.button.secondary}
          `}
        >
          Type
        </button>
      </div>

      {/* Input Area */}
      {inputMethod === "drawing" ? (
        <StrokeCanvas
          character={character}
          onStrokeComplete={validateStrokeOrder}
        />
      ) : (
        <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className={`
              ${formStyles.input.base}
              ${formStyles.input.focus}
            `}
            placeholder="Type hiragana or romaji..."
          />
          <button
            onClick={validateTextInput}
            className={`
              ${formStyles.button.base}
              ${formStyles.button.primary}
            `}
          >
            Check
          </button>
        </div>
      )}

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className={`${layoutStyles.col} ${layoutStyles.gap.sm}`}>
          {feedback.map((message, index) => (
            <div
              key={index}
              className={`
                ${textStyles.sm}
                ${message.includes("correct") ? "text-green-500" : "text-red-500"}
              `}
            >
              {message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
