import { ValidationFactory } from '@/lib/validation/ValidationFactory';
import { ValidationResult } from '@/lib/validation/core/ValidationStrategy';

/**
 * Test component to verify the new validation system works correctly
 */
export function ValidationSystemTest() {
  const testValidation = () => {
    const engine = ValidationFactory.createStandardEngine();
    
    console.log('Available validator types:', engine.getAvailableTypes());
    
    // Test Hiragana validation
    const hiraganaResult = engine.validate('あか', 'あか', 'hiragana');
    console.log('Hiragana test:', hiraganaResult);
    
    // Test English validation
    const englishResult = engine.validate('red', 'red', 'english');
    console.log('English test:', englishResult);
    
    // Test Katakana validation
    const katakanaResult = engine.validate('アカ', 'アカ', 'katakana');
    console.log('Katakana test:', katakanaResult);
    
    // Test Kanji validation
    const kanjiResult = engine.validate('赤', '赤', 'kanji');
    console.log('Kanji test:', kanjiResult);
    
    return {
      hiraganaResult,
      englishResult,
      katakanaResult,
      kanjiResult
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Validation System Test</h2>
      <button 
        onClick={testValidation}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Validation Tests
      </button>
      <p className="mt-2 text-sm text-gray-600">
        Check browser console for test results
      </p>
    </div>
  );
}
