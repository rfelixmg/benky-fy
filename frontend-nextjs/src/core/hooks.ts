import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  apiClient, 
  FlashcardItem, 
  ConjugationItem, 
  ConjugationForm,
  ConjugationResponse,
  UserSettings, 
  AuthResponse, 
  AnswerCheckResponse,
  ValidationRequest,
  ValidationResponse
} from './api-client';
import { romajiToHiragana, romajiToKatakana, detectScript } from './romaji-conversion';

// Authentication hooks
export const useAuth = () => {
  return useQuery<AuthResponse>({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        // Try to get real authentication from backend
        const response = await apiClient.checkAuth();
        if (response.success && response.data?.authenticated) {
          return response.data;
        }
      } catch (error) {
        console.log('Auth check failed, using fallback:', error);
      }
      
      // Fallback to dummy data only in development
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        return {
          authenticated: true,
          user: {
            name: 'Test User',
            email: 'test@example.com',
            picture: '/user_icon.svg',
          },
          session_keys: ['user'],
          google_authorized: true,
        };
      }
      
      // Production: return unauthenticated
      return {
        authenticated: false,
        user: undefined,
        session_keys: [],
        google_authorized: false,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Flashcard hooks - Updated for V2 API
export const useWordsData = (moduleName: string) => {
  return useQuery<FlashcardItem[]>({
    queryKey: ['words', moduleName],
    queryFn: async () => {
      const response = await apiClient.getWordsData(moduleName);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch words data');
      }
      return response.data;
    },
    enabled: !!moduleName,
  });
};

// Random word selection hook for queue-based selection
export const useRandomWord = (moduleName: string) => {
  return useQuery<FlashcardItem>({
    queryKey: ['randomWord', moduleName],
    queryFn: async () => {
      const response = await apiClient.getRandomWord(moduleName);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch random word');
      }
      return response.data;
    },
    enabled: !!moduleName,
    staleTime: 0, // Always fetch fresh random word
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Comprehensive answer validation with input type support
export const validateAnswer = (
  userAnswer: string, 
  correctAnswers: {
    hiragana?: string;
    katakana?: string;
    english?: string;
    kanji?: string;
  },
  settings: UserSettings
): { isCorrect: boolean; matchedType?: string; convertedAnswer?: string; timerDuration?: number; results?: boolean[] } => {
  if (!userAnswer.trim()) {
    return { isCorrect: false, timerDuration: 10000 };
  }

  // Convert romaji input if enabled
  let processedAnswer = userAnswer.trim();
  let convertedAnswer: string | undefined;
  
  if (settings.romajiConversionEnabled) {
    const scriptType = detectScript(userAnswer);
    if (scriptType === 'romaji') {
      if (settings.romaji_output_type === 'hiragana') {
        const conversion = romajiToHiragana(userAnswer);
        processedAnswer = conversion.converted;
        convertedAnswer = conversion.converted;
      } else if (settings.romaji_output_type === 'katakana') {
        const conversion = romajiToKatakana(userAnswer);
        processedAnswer = conversion.converted;
        convertedAnswer = conversion.converted;
      } else {
        // Auto-detect: default to hiragana
        const conversion = romajiToHiragana(userAnswer);
        processedAnswer = conversion.converted;
        convertedAnswer = conversion.converted;
      }
    }
  }

  // Normalize function for comparison
  const normalize = (text: string) => 
    text.toLowerCase().trim().replace(/[\s\u3000]/g, ''); // Remove spaces and full-width spaces

  const normalizedUser = normalize(processedAnswer);

  // Get enabled input types in consistent order (same as floating feedback component)
  const getEnabledTypes = () => {
    const types = [];
    if (settings.input_hiragana) types.push('hiragana');
    if (settings.input_katakana) types.push('katakana');
    if (settings.input_kanji) types.push('kanji');
    if (settings.input_english) types.push('english');
    if (settings.input_romaji) types.push('romaji');
    return types;
  };

  const enabledTypes = getEnabledTypes();
  const results = [];

  // Validate each enabled input type in order
  for (const type of enabledTypes) {
    let isCorrect = false;
    
    switch (type) {
      case 'hiragana':
        if (correctAnswers.hiragana) {
          const normalizedCorrect = normalize(correctAnswers.hiragana);
          isCorrect = normalizedUser === normalizedCorrect;
        }
        break;
      case 'katakana':
        if (correctAnswers.katakana) {
          const normalizedCorrect = normalize(correctAnswers.katakana);
          isCorrect = normalizedUser === normalizedCorrect;
        }
        break;
      case 'english':
        if (correctAnswers.english) {
          const normalizedCorrect = normalize(correctAnswers.english);
          isCorrect = normalizedUser === normalizedCorrect;
        }
        break;
      case 'kanji':
        if (correctAnswers.kanji) {
          const normalizedCorrect = normalize(correctAnswers.kanji);
          isCorrect = normalizedUser === normalizedCorrect;
        }
        break;
      case 'romaji':
        const scriptType = detectScript(userAnswer);
        if (scriptType === 'romaji') {
          // Check against all possible answers for romaji
          if (correctAnswers.hiragana) {
            const normalizedCorrect = normalize(correctAnswers.hiragana);
            if (normalizedUser === normalizedCorrect) isCorrect = true;
          }
          if (correctAnswers.katakana) {
            const normalizedCorrect = normalize(correctAnswers.katakana);
            if (normalizedUser === normalizedCorrect) isCorrect = true;
          }
          if (correctAnswers.english) {
            const normalizedCorrect = normalize(correctAnswers.english);
            if (normalizedUser === normalizedCorrect) isCorrect = true;
          }
          if (correctAnswers.kanji) {
            const normalizedCorrect = normalize(correctAnswers.kanji);
            if (normalizedUser === normalizedCorrect) isCorrect = true;
          }
        }
        break;
    }
    
    results.push(isCorrect);
  }

  // Determine overall correctness and matched type
  const correctCount = results.filter(Boolean).length;
  const totalCount = results.length;
  const isCorrect = correctCount > 0;
  
  // Find the first correct match for matchedType
  let matchedType: string | undefined;
  for (let i = 0; i < results.length; i++) {
    if (results[i]) {
      matchedType = enabledTypes[i];
      break;
    }
  }

  // Determine timer duration based on results
  let timerDuration = 10000; // Default for wrong answer
  if (correctCount === totalCount) {
    timerDuration = 6000; // All correct
  } else if (correctCount > 0) {
    timerDuration = 8000; // Partial correct
  }

  return { 
    isCorrect,
    matchedType,
    convertedAnswer: convertedAnswer || processedAnswer,
    timerDuration,
    results: results.length > 0 ? results : undefined // Always include results when there are enabled inputs
  };
};

// V2 Conjugation hooks
export const useConjugationData = (wordId: string) => {
  return useQuery<ConjugationResponse>({
    queryKey: ['conjugation', wordId],
    queryFn: async () => {
      const response = await apiClient.getConjugationData(wordId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch conjugation data');
      }
      return response.data;
    },
    enabled: !!wordId,
  });
};

// Frontend conjugation validation (V2 API doesn't provide checking)
export const validateConjugationAnswer = (
  userInput: string, 
  correctAnswer: string
): { isCorrect: boolean; feedback: string } => {
  const normalize = (text: string) => 
    text.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const normalizedUser = normalize(userInput);
  const normalizedCorrect = normalize(correctAnswer);
  
  const isCorrect = normalizedUser === normalizedCorrect;
  
  return {
    isCorrect,
    feedback: isCorrect ? 'Correct!' : `Expected: ${correctAnswer}`
  };
};

// Settings hooks
export const useSettings = (moduleName: string) => {
  return useQuery<UserSettings>({
    queryKey: ['settings', moduleName],
    queryFn: async () => {
      const response = await apiClient.getSettings(moduleName);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch settings');
      }
      return response.data;
    },
    enabled: !!moduleName,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      moduleName, 
      settings 
    }: { 
      moduleName: string; 
      settings: Partial<UserSettings>; 
    }) => {
      const response = await apiClient.updateSettings(moduleName, settings);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update settings');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['settings', variables.moduleName], data);
    },
  });
};

// Answer tracking hooks
export interface AnswerResult {
  moduleName: string;
  itemId: string;
  userAnswer: string;
  isCorrect: boolean;
  matchedType?: string;
  attempts: number;
  timestamp: string;
  timerDuration?: number;
  settings: Partial<UserSettings>;
}

export const useTrackAnswer = () => {
  return useMutation({
    mutationFn: async (result: AnswerResult) => {
      // Send to backend feedback endpoint
      const response = await apiClient.submitFeedback({
        moduleName: result.moduleName,
        itemId: result.itemId,
        userAnswer: result.userAnswer,
        isCorrect: result.isCorrect,
        matchedType: result.matchedType,
        attempts: result.attempts,
        timestamp: result.timestamp,
        settings: {
          input_hiragana: result.settings.input_hiragana || false,
          input_katakana: result.settings.input_katakana || false,
          input_english: result.settings.input_english || false,
          input_kanji: result.settings.input_kanji || false,
          input_romaji: result.settings.input_romaji || false,
          display_mode: result.settings.display_mode || 'kanji_furigana',
          furigana_style: result.settings.furigana_style || 'ruby'
        }
      });
      
      return response;
    },
    onError: (error) => {
      console.error('Failed to track answer result:', error);
    },
  });
};

// Help hooks
export const useWordInfo = (word: string) => {
  return useQuery({
    queryKey: ['wordInfo', word],
    queryFn: async () => {
      const response = await apiClient.getWordInfo(word);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch word info');
      }
      return response.data;
    },
    enabled: !!word && word.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// V2 Validation hooks
export const useValidateInput = () => {
  return useMutation({
    mutationFn: async (request: ValidationRequest) => {
      const response = await apiClient.validateInput(request);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to validate input');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Input validation failed:', error);
    },
  });
};

export const useValidateStrokeOrder = () => {
  return useMutation({
    mutationFn: async (request: ValidationRequest) => {
      const response = await apiClient.validateStrokeOrder(request);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to validate stroke order');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Stroke order validation failed:', error);
    },
  });
};
