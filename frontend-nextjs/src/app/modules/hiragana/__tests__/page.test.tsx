/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import HiraganaModule from '../page';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      characters: [
        { character: 'あ', reading: 'a' },
        { character: 'い', reading: 'i' },
        { character: 'う', reading: 'u' },
      ],
      practice_words: [
        { id: '1', hiragana: 'あい', english: 'love' },
        { id: '2', hiragana: 'うえ', english: 'up' },
      ],
      quiz_questions: [
        {
          id: '1',
          question: 'あ',
          correctAnswer: 'a',
          options: ['a', 'i', 'u', 'e'],
          hint: 'First hiragana character',
        },
      ],
    }),
  })
) as jest.Mock;

describe('HiraganaModule Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render module title and description', () => {
    render(<HiraganaModule />);
    
    expect(screen.getByText(/hiragana/i)).toBeInTheDocument();
    expect(screen.getByText(/basic japanese writing system/i)).toBeInTheDocument();
  });

  it('should load and display character grid', async () => {
    render(<HiraganaModule />);
    
    await waitFor(() => {
      expect(screen.getByText('あ')).toBeInTheDocument();
      expect(screen.getByText('い')).toBeInTheDocument();
      expect(screen.getByText('う')).toBeInTheDocument();
    });
  });

  it('should switch between learning modes', async () => {
    render(<HiraganaModule />);
    
    // Default: Character Grid
    await waitFor(() => {
      expect(screen.getByText('あ')).toBeInTheDocument();
    });

    // Switch to Practice
    const practiceButton = screen.getByRole('button', { name: /practice/i });
    fireEvent.click(practiceButton);
    expect(screen.getByPlaceholderText(/enter your answer/i)).toBeInTheDocument();

    // Switch to Quiz
    const quizButton = screen.getByRole('button', { name: /quiz/i });
    fireEvent.click(quizButton);
    expect(screen.getByText(/first hiragana character/i)).toBeInTheDocument();
  });

  it('should show progress tracking', async () => {
    render(<HiraganaModule />);
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    render(<HiraganaModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading module data/i)).toBeInTheDocument();
    });
  });

  it('should persist progress across mode switches', async () => {
    render(<HiraganaModule />);
    
    // Complete a practice word
    const practiceButton = screen.getByRole('button', { name: /practice/i });
    fireEvent.click(practiceButton);

    const input = screen.getByPlaceholderText(/enter your answer/i);
    fireEvent.change(input, { target: { value: 'あい' } });
    fireEvent.click(screen.getByRole('button', { name: /check/i }));

    // Switch to quiz and back
    const quizButton = screen.getByRole('button', { name: /quiz/i });
    fireEvent.click(quizButton);
    fireEvent.click(practiceButton);

    // Progress should remain
    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });
  });

  it('should be keyboard navigable', async () => {
    render(<HiraganaModule />);
    
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
    expect(buttons[1]).toHaveFocus();
  });

  it('should show loading state', () => {
    render(<HiraganaModule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
