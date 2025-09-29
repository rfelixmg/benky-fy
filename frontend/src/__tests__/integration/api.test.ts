import { fetchModules, fetchFlashcards, submitAnswer } from '@/lib/api';
import { testModules, testFlashcards } from '@/lib/testData';

describe('API Integration', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  describe('fetchModules', () => {
    it('handles successful response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testModules),
      });

      const modules = await fetchModules();
      expect(modules).toEqual(testModules);
    });

    it('handles array response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...testModules]),
      });

      const modules = await fetchModules();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBe(testModules.length);
    });

    it('handles error with fallback', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const modules = await fetchModules();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
    });
  });

  describe('fetchFlashcards', () => {
    const moduleId = 'test-hiragana';

    it('handles successful response with cards array', async () => {
      const mockCards = testFlashcards[moduleId];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCards),
      });

      const result = await fetchFlashcards(moduleId);
      expect(result).toHaveProperty('cards');
      expect(result).toHaveProperty('progress');
      expect(Array.isArray(result.cards)).toBe(true);
      expect(result.cards).toEqual(mockCards);
    });

    it('handles successful response with structured data', async () => {
      const mockResponse = {
        cards: testFlashcards[moduleId],
        progress: {
          total: testFlashcards[moduleId].length,
          completed: 5,
          correct: 4,
          streak: 2,
        },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchFlashcards(moduleId);
      expect(result).toEqual(mockResponse);
    });

    it('handles error with fallback data', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchFlashcards(moduleId);
      expect(result).toHaveProperty('cards');
      expect(result).toHaveProperty('progress');
      expect(result.cards.length).toBeGreaterThan(0);
      expect(result.progress.total).toBe(result.cards.length);
    });

    it('handles non-existent module with empty fallback', async () => {
      const nonExistentId = 'non-existent-module';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

      const result = await fetchFlashcards(nonExistentId);
      expect(result).toHaveProperty('cards');
      expect(result).toHaveProperty('progress');
      expect(result.cards).toEqual([]);
      expect(result.progress.total).toBe(0);
    });
  });

  describe('submitAnswer', () => {
    const moduleId = 'test-hiragana';
    const cardId = 'h1';

    it('handles successful submission', async () => {
      const mockResponse = { success: true, message: 'Answer recorded' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await submitAnswer(moduleId, cardId, true);
      expect(result).toEqual(mockResponse);
    });

    it('handles error with offline fallback', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await submitAnswer(moduleId, cardId, true);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('offline');
    });

    it('retries on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const result = await submitAnswer(moduleId, cardId, true);
      expect(result).toHaveProperty('success', true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
