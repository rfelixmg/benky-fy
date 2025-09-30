'use client';

import { useState, useEffect, useRef } from 'react';
import { romajiToHiragana, romajiToKatakana, detectScript } from '@/lib/romaji-conversion';

interface RomajiInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  outputType?: 'hiragana' | 'katakana' | 'auto';
  showPreview?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export function RomajiInput({
  value,
  onChange,
  placeholder = "Enter romaji...",
  disabled = false,
  className = "",
  outputType = 'auto',
  showPreview = true,
  onKeyPress
}: RomajiInputProps) {
  const [preview, setPreview] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert romaji to kana for preview
  useEffect(() => {
    if (!value.trim() || !showPreview) {
      setPreview('');
      return;
    }

    setIsConverting(true);
    
    // Debounce conversion
    const timeoutId = setTimeout(() => {
      try {
        let converted = '';
        
        if (outputType === 'katakana') {
          converted = romajiToKatakana(value).converted;
        } else if (outputType === 'hiragana') {
          converted = romajiToHiragana(value).converted;
        } else {
          // Auto-detect based on input
          const scriptType = detectScript(value);
          if (scriptType === 'romaji') {
            converted = romajiToHiragana(value).converted;
          } else {
            converted = value;
          }
        }
        
        setPreview(converted);
      } catch (error) {
        console.error('Romaji conversion error:', error);
        setPreview('');
      } finally {
        setIsConverting(false);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [value, outputType, showPreview]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  const handleFocus = () => {
    inputRef.current?.select();
  };

  return (
    <div className="relative">
      {/* Main Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50 ${className}`}
      />
      
      {/* Preview */}
      {showPreview && preview && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
          <div className="flex items-center gap-2">
            {isConverting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span className="text-white/70 text-sm font-medium">
              {preview}
            </span>
          </div>
        </div>
      )}
      
      {/* Conversion Indicator */}
      {showPreview && value && !preview && !isConverting && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
          <span className="text-white/40 text-xs">Invalid romaji</span>
        </div>
      )}
    </div>
  );
}

/**
 * Romaji input with conversion options
 */
export function RomajiInputWithOptions({
  value,
  onChange,
  placeholder = "Enter romaji...",
  disabled = false,
  className = "",
  onKeyPress
}: Omit<RomajiInputProps, 'outputType' | 'showPreview'>) {
  const [outputType, setOutputType] = useState<'hiragana' | 'katakana' | 'auto'>('auto');
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-3">
      {/* Options */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-white/80">Output:</label>
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as 'hiragana' | 'katakana' | 'auto')}
            className="px-2 py-1 rounded bg-white/20 border border-white/30 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
          >
            <option value="auto" className="bg-gray-800">Auto</option>
            <option value="hiragana" className="bg-gray-800">Hiragana</option>
            <option value="katakana" className="bg-gray-800">Katakana</option>
          </select>
        </div>
        
        <label className="flex items-center gap-2 text-white/80">
          <input
            type="checkbox"
            checked={showPreview}
            onChange={(e) => setShowPreview(e.target.checked)}
            className="rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
          />
          Show preview
        </label>
      </div>

      {/* Input */}
      <RomajiInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        outputType={outputType}
        showPreview={showPreview}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}
