import { ValidatorFactory } from '@/lib/validation/factories/ValidatorFactory';
import { ModuleValidatorFactory } from '@/lib/validation/factories/ModuleValidatorFactory';
import { FlashcardValidator } from '@/lib/validation/activity-types/FlashcardValidator';
import { ConjugationValidator } from '@/lib/validation/activity-types/ConjugationValidator';
import { AnswerSet, UserSettings, ConjugationForm } from '@/lib/validation/activity-types/ActivityValidator';

/**
 * Test component to verify Sprint 2 factory system works correctly
 */
export function Sprint2FactoryTest() {
  const testValidatorFactory = () => {
    console.log('=== Testing ValidatorFactory ===');
    
    // Test supported types
    console.log('Supported types:', ValidatorFactory.getSupportedTypes());
    
    // Test creating validators
    try {
      const hiraganaValidator = ValidatorFactory.createValidator('hiragana');
      console.log('Hiragana validator created:', hiraganaValidator);
      
      const englishValidator = ValidatorFactory.createValidator('english');
      console.log('English validator created:', englishValidator);
      
      // Test validation
      const result = hiraganaValidator.validate('あか', 'あか');
      console.log('Hiragana validation result:', result);
      
    } catch (error) {
      console.error('ValidatorFactory error:', error);
    }
  };

  const testModuleValidatorFactory = () => {
    console.log('=== Testing ModuleValidatorFactory ===');
    
    // Test supported modules
    console.log('Supported modules:', ModuleValidatorFactory.getSupportedModules());
    
    // Test creating module validators
    try {
      const colorsValidator = ModuleValidatorFactory.createModuleValidator('colors');
      console.log('Colors validator created:', colorsValidator);
      
      const verbsValidator = ModuleValidatorFactory.createModuleValidator('verbs');
      console.log('Verbs validator created:', verbsValidator);
      
      // Test validator types
      console.log('Colors validator type:', ModuleValidatorFactory.getValidatorType('colors'));
      console.log('Verbs validator type:', ModuleValidatorFactory.getValidatorType('verbs'));
      
    } catch (error) {
      console.error('ModuleValidatorFactory error:', error);
    }
  };

  const testFlashcardValidator = () => {
    console.log('=== Testing FlashcardValidator ===');
    
    const validator = new FlashcardValidator();
    const settings: UserSettings = {
      input_english: true,
      input_hiragana: true,
      input_katakana: false,
      input_kanji: false,
      input_romaji: false
    };
    
    const correctAnswers: AnswerSet = {
      english: 'red',
      hiragana: 'あか',
      kanji: '赤'
    };
    
    // Test single answer validation
    const result = validator.validateAnswer('red', correctAnswers, settings);
    console.log('Flashcard validation result:', result);
    
    // Test enabled input types
    const enabledTypes = validator.getEnabledInputTypes(settings);
    console.log('Enabled input types:', enabledTypes);
  };

  const testConjugationValidator = () => {
    console.log('=== Testing ConjugationValidator ===');
    
    const validator = new ConjugationValidator();
    
    const conjugationForm: ConjugationForm = {
      form: 'present',
      hiragana: 'かいます',
      english: 'buy'
    };
    
    // Test conjugation validation
    const result = validator.validateConjugation('かいます', conjugationForm);
    console.log('Conjugation validation result:', result);
  };

  const runAllTests = () => {
    testValidatorFactory();
    testModuleValidatorFactory();
    testFlashcardValidator();
    testConjugationValidator();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sprint 2 Factory System Test</h2>
      <div className="space-y-2">
        <button 
          onClick={testValidatorFactory}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
        >
          Test ValidatorFactory
        </button>
        <button 
          onClick={testModuleValidatorFactory}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
        >
          Test ModuleValidatorFactory
        </button>
        <button 
          onClick={testFlashcardValidator}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mr-2"
        >
          Test FlashcardValidator
        </button>
        <button 
          onClick={testConjugationValidator}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mr-2"
        >
          Test ConjugationValidator
        </button>
        <button 
          onClick={runAllTests}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Run All Tests
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Check browser console for test results
      </p>
    </div>
  );
}
