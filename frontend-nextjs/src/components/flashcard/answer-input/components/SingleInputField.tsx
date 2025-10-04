import React from 'react';
import { cn } from '@/lib/utils';

interface SingleInputFieldProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

/**
 * Single input field component for AnswerInput
 */
export const SingleInputField: React.FC<SingleInputFieldProps> = React.forwardRef<
  HTMLInputElement,
  SingleInputFieldProps
>(({
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  onKeyDown,
  onFocus,
  onBlur
}, ref) => {
  const getInputType = () => {
    switch (type) {
      case 'hiragana':
      case 'katakana':
      case 'kanji':
        return 'text';
      case 'english':
        return 'text';
      case 'romaji':
        return 'text';
      default:
        return 'text';
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (type) {
      case 'hiragana':
        return 'ひらがな';
      case 'katakana':
        return 'カタカナ';
      case 'kanji':
        return '漢字';
      case 'english':
        return 'English';
      case 'romaji':
        return 'romaji';
      default:
        return 'Enter answer...';
    }
  };

  return (
    <input
      ref={ref}
      type={getInputType()}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={getPlaceholder()}
      disabled={disabled}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        'w-full px-3 py-2 border border-gray-300 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        className
      )}
    />
  );
});

SingleInputField.displayName = 'SingleInputField';
