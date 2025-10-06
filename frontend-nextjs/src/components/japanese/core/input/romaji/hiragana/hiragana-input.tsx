'use client';

import { useState, useRef } from "react";
import { useRomajiConversion } from "../hooks/use-romaji-conversion";
import { RomajiInputProps } from "@/components/japanese/types/input";

export function RomajiInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  showPreview = true,
  onKeyPress,
}: Omit<RomajiInputProps, "outputType">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const conversionHelper = useRomajiConversion();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Convert immediately and update the input
    const converted = conversionHelper.autoConvert(newValue, "hiragana");
    onChange(converted);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onKeyPress?.(e);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50 ${className}`}
        onKeyDown={handleKeyPress}
      />
    </div>
  );
}