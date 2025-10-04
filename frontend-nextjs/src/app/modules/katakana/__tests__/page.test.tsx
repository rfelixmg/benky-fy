/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import KatakanaModule from '../page';

describe('KatakanaModule', () => {
  const mockData = {
    characters: [
      { character: 'ア', reading: 'a' },
      { character: 'イ', reading: 'i' },
    ],
    practice_words: [
      { id: '1', katakana: 'コーヒー', english: 'coffee' },
      { id: '2', katakana: 'パン', english: 'bread' },
    ],
    quiz_questions: [
      {
        id: '1',
        question: 'ア',
        correctAnswer: 'a',
        options: ['a', 'i', 'u', 'e'],
        hint: 'First katakana character',
      },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    ) as jest.Mock;
  });

  it('should render module title and description', () => {
    render(<KatakanaModule />);
    
    expect(screen.getByText('Katakana')).toBeInTheDocument();
    expect(screen.getByText(/foreign words/i)).toBeInTheDocument();
  });

  it('should load and display character grid', async () => {
    render(<KatakanaModule />);
    
    await waitFor(() => {
      expect(screen.getByText('ア')).toBeInTheDocument();
      expect(screen.getByText('イ')).toBeInTheDocument();
    });
  });

  it('should switch between learning modes', async () => {
    render(<KatakanaModule />);
    
    // Default: Character Grid
    await waitFor(() => {
      expect(screen.getByText('ア')).toBeInTheDocument();
    });

    // Switch to Practice
    fireEvent.click(screen.getByText('Practice'));
    expect(screen.getByPlaceholderText(/enter your answer/i)).toBeInTheDocument();

    // Switch to Quiz
    fireEvent.click(screen.getByText('Quiz'));
    expect(screen.getByText(/first katakana character/i)).toBeInTheDocument();
  });

  it('should track progress', async () => {
    render(<KatakanaModule />);
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    // Click a character
    fireEvent.click(screen.getByText('ア'));
    expect(screen.getByText('1')).toBeInTheDocument(); // Total count increased
  });

  it('should handle API errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    render(<KatakanaModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument();
    });
  });

  it('should support writing practice', async () => {
    render(<KatakanaModule />);
    
    fireEvent.click(screen.getByText('Write'));
    await waitFor(() => {
      expect(screen.getByText('ア')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument();
    });
  });

  it('should be keyboard navigable', () => {
    render(<KatakanaModule />);
    
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
    expect(buttons[1]).toHaveFocus();
  });

  it('should show loading state', () => {
    render(<KatakanaModule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
