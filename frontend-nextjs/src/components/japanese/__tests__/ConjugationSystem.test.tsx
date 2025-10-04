import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ConjugationSystem } from '../ConjugationSystem';

describe('ConjugationSystem Component', () => {
  const mockWord = {
    word_id: 'a1e9e1b8-4846-5387-9b64-881e21bd7a0d',
    base_form: {
      kanji: '見る',
      hiragana: 'みる',
      english: 'to see',
      type: 'verb'
    },
    conjugations: [
      {
        form: 'polite',
        kanji: '見ます',
        hiragana: 'みます'
      },
      {
        form: 'negative',
        kanji: '見ない',
        hiragana: 'みない'
      },
      {
        form: 'past',
        kanji: '見た',
        hiragana: 'みた'
      },
      {
        form: 'past_negative',
        kanji: '見なかった',
        hiragana: 'みなかった'
      }
    ]
  };

  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWord)
    });
  });

  it('should render base form correctly', async () => {
    render(<ConjugationSystem wordId={mockWord.word_id} />);
    
    await waitFor(() => {
      expect(screen.getByText('見る')).toBeInTheDocument();
      expect(screen.getByText('みる')).toBeInTheDocument();
      expect(screen.getByText('to see')).toBeInTheDocument();
    });
  });

  it('should display all conjugation forms', async () => {
    render(<ConjugationSystem wordId={mockWord.word_id} />);
    
    await waitFor(() => {
      mockWord.conjugations.forEach(conj => {
        expect(screen.getByText(conj.kanji)).toBeInTheDocument();
        expect(screen.getByText(conj.hiragana)).toBeInTheDocument();
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));
    render(<ConjugationSystem wordId={mockWord.word_id} />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading conjugations/i)).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    render(<ConjugationSystem wordId={mockWord.word_id} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle word not found', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Word not found' })
    });
    
    render(<ConjugationSystem wordId="invalid-id" />);
    
    await waitFor(() => {
      expect(screen.getByText(/word not found/i)).toBeInTheDocument();
    });
  });

  it('should toggle furigana display', async () => {
    render(<ConjugationSystem wordId={mockWord.word_id} />);
    
    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: /toggle furigana/i });
      fireEvent.click(toggleButton);
      expect(screen.queryByText('みる')).not.toBeVisible();
    });
  });

  it('should be keyboard navigable', async () => {
    render(<ConjugationSystem wordId={mockWord.word_id} />);
    
    await waitFor(() => {
      const forms = screen.getAllByRole('button');
      forms[0].focus();
      fireEvent.keyDown(forms[0], { key: 'ArrowRight' });
      expect(forms[1]).toHaveFocus();
    });
  });

  it('should handle different word types correctly', async () => {
    const mockAdjective = {
      ...mockWord,
      base_form: {
        kanji: '大きい',
        hiragana: 'おおきい',
        english: 'big',
        type: 'adjective'
      },
      conjugations: [
        {
          form: 'present',
          kanji: '大きい',
          hiragana: 'おおきい'
        },
        {
          form: 'past',
          kanji: '大きかった',
          hiragana: 'おおきかった'
        },
        {
          form: 'negative',
          kanji: '大きくない',
          hiragana: 'おおきくない'
        }
      ]
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAdjective)
    });
    
    render(<ConjugationSystem wordId="adjective-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('大きい')).toBeInTheDocument();
      expect(screen.getByText('おおきい')).toBeInTheDocument();
      mockAdjective.conjugations.forEach(conj => {
        expect(screen.getByText(conj.kanji)).toBeInTheDocument();
      });
    });
  });
});
