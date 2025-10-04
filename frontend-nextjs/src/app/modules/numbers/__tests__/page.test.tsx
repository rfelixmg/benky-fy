/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import NumbersModule from '../page';

describe('NumbersModule', () => {
  const mockBasicData = {
    numbers: [
      { kanji: '一', hiragana: 'いち', value: 1 },
      { kanji: '二', hiragana: 'に', value: 2 },
    ],
    practice_sets: [
      {
        id: '1',
        numbers: [1, 2],
        type: 'reading',
      },
    ],
    quiz_questions: [
      {
        id: '1',
        question: '一',
        correctAnswer: 'いち',
        options: ['いち', 'に', 'さん'],
        hint: 'Number one',
      },
    ],
  };

  const mockExtendedData = {
    numbers: [
      { kanji: '百', hiragana: 'ひゃく', value: 100 },
      { kanji: '千', hiragana: 'せん', value: 1000 },
    ],
    practice_sets: [
      {
        id: '2',
        numbers: [100, 1000],
        type: 'conversion',
      },
    ],
    quiz_questions: [
      {
        id: '2',
        question: '百',
        correctAnswer: 'ひゃく',
        options: ['ひゃく', 'せん', 'まん'],
        hint: 'Hundred',
      },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBasicData),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockExtendedData),
      })) as jest.Mock;
  });

  it('should render module title and description', () => {
    render(<NumbersModule />);
    
    expect(screen.getByText(/Japanese Numbers/i)).toBeInTheDocument();
    expect(screen.getByText(/Learn to read and write/i)).toBeInTheDocument();
  });

  it('should load and display basic numbers', async () => {
    render(<NumbersModule />);
    
    await waitFor(() => {
      expect(screen.getByText('一')).toBeInTheDocument();
      expect(screen.getByText('二')).toBeInTheDocument();
    });
  });

  it('should switch between number modes', async () => {
    render(<NumbersModule />);
    
    // Default: Basic numbers
    await waitFor(() => {
      expect(screen.getByText('一')).toBeInTheDocument();
    });

    // Switch to extended numbers
    fireEvent.click(screen.getByText('Extended Numbers'));
    await waitFor(() => {
      expect(screen.getByText('百')).toBeInTheDocument();
      expect(screen.getByText('千')).toBeInTheDocument();
    });
  });

  it('should handle practice mode', async () => {
    render(<NumbersModule />);
    
    fireEvent.click(screen.getByText('Practice'));
    await waitFor(() => {
      expect(screen.getByText('1, 2')).toBeInTheDocument();
    });
  });

  it('should track progress', async () => {
    render(<NumbersModule />);
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    // Click a number
    fireEvent.click(screen.getByText('一'));
    expect(screen.getByText('1')).toBeInTheDocument(); // Total count increased
  });

  it('should handle API errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    render(<NumbersModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument();
    });
  });

  it('should show quiz questions', async () => {
    render(<NumbersModule />);
    
    fireEvent.click(screen.getByText('Quiz'));
    await waitFor(() => {
      expect(screen.getByText('Number one')).toBeInTheDocument();
    });
  });

  it('should be keyboard navigable', async () => {
    render(<NumbersModule />);
    
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
    expect(buttons[1]).toHaveFocus();
  });

  it('should show loading state', () => {
    render(<NumbersModule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should combine basic and extended data', async () => {
    render(<NumbersModule />);
    
    await waitFor(() => {
      // Basic numbers visible first
      expect(screen.getByText('一')).toBeInTheDocument();
      
      // Switch to extended
      fireEvent.click(screen.getByText('Extended Numbers'));
      expect(screen.getByText('百')).toBeInTheDocument();
    });
  });
});
