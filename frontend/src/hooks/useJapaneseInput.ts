import { useState, useMemo, useCallback } from 'react';
import { Script, ConversionOptions } from '../types/japanese';
import { JapaneseText } from '../utils/japanese';

interface UseJapaneseInputOptions extends ConversionOptions {
  validateOnChange?: boolean;
}

export function useJapaneseInput(options: UseJapaneseInputOptions = { script: 'hiragana' }) {
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState(true);

  const converted = useMemo(() => 
    JapaneseText.convert(input, options),
    [input, options]
  );

  const handleInput = useCallback((value: string) => {
    setInput(value);
    if (options.validateOnChange) {
      setIsValid(JapaneseText.isValid(value, options.script));
    }
  }, [options]);

  const validate = useCallback(() => {
    const valid = JapaneseText.isValid(input, options.script);
    setIsValid(valid);
    return valid;
  }, [input, options.script]);

  return {
    input,
    setInput: handleInput,
    converted,
    isValid,
    validate,
  };
}
