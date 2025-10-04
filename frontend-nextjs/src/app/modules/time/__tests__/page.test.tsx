/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import TimeModule from '../page';

describe('TimeModule', () => {
  const mockDaysData = {
    units: [
      { kanji: '月曜日', hiragana: 'げつようび', english: 'Monday' },
      { kanji: '火曜日', hiragana: 'かようび', english: 'Tuesday' },
    ],
    practice_sets: [
      {
        id: '1',
        units: ['月曜日', '火曜日'],
        type: 'reading',
      },
    ],
    quiz_questions: [
      {
        id: '1',
        question: '月曜日',
        correctAnswer: 'げつようび',
        options: ['げつようび', 'かようび', 'すいようび'],
        hint: 'First day of the week',
      },
    ],
  };

  const mockMonthsData = {
    units: [
      { kanji: '一月', hiragana: 'いちがつ', english: 'January' },
      { kanji: '二月', hiragana: 'にがつ', english: 'February' },
    ],
    practice_sets: [
      {
        id: '2',
        units: ['一月', '二月'],
        type: 'ordering',
      },
    ],
    quiz_questions: [
      {
        id: '2',
        question: '一月',
        correctAnswer: 'いちがつ',
        options: ['いちがつ', 'にがつ', 'さんがつ'],
        hint: 'First month',
      },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDaysData),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMonthsData),
      })) as jest.Mock;
  });

  it('should render module title and description', () => {
    render(<TimeModule />);
    
    expect(screen.getByText(/Japanese Time Units/i)).toBeInTheDocument();
    expect(screen.getByText(/days of the week and months/i)).toBeInTheDocument();
  });

  it('should load and display days of week', async () => {
    render(<TimeModule />);
    
    await waitFor(() => {
      expect(screen.getByText('月曜日')).toBeInTheDocument();
      expect(screen.getByText('火曜日')).toBeInTheDocument();
    });
  });

  it('should switch between days and months', async () => {
    render(<TimeModule />);
    
    // Default: Days
    await waitFor(() => {
      expect(screen.getByText('月曜日')).toBeInTheDocument();
    });

    // Switch to months
    fireEvent.click(screen.getByText('Months'));
    await waitFor(() => {
      expect(screen.getByText('一月')).toBeInTheDocument();
      expect(screen.getByText('二月')).toBeInTheDocument();
    });
  });

  it('should handle practice mode', async () => {
    render(<TimeModule />);
    
    fireEvent.click(screen.getByText('Practice'));
    await waitFor(() => {
      expect(screen.getByText('月曜日, 火曜日')).toBeInTheDocument();
    });
  });

  it('should track progress', async () => {
    render(<TimeModule />);
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    // Click a time unit
    fireEvent.click(screen.getByText('月曜日'));
    expect(screen.getByText('1')).toBeInTheDocument(); // Total count increased
  });

  it('should handle API errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    render(<TimeModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument();
    });
  });

  it('should show quiz questions', async () => {
    render(<TimeModule />);
    
    fireEvent.click(screen.getByText('Quiz'));
    await waitFor(() => {
      expect(screen.getByText('First day of the week')).toBeInTheDocument();
    });
  });

  it('should be keyboard navigable', async () => {
    render(<TimeModule />);
    
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
    expect(buttons[1]).toHaveFocus();
  });

  it('should show loading state', () => {
    render(<TimeModule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should maintain correct ordering', async () => {
    render(<TimeModule />);
    
    await waitFor(() => {
      const days = screen.getAllByRole('button').map(b => b.textContent);
      expect(days.indexOf('月曜日')).toBeLessThan(days.indexOf('火曜日'));
    });

    fireEvent.click(screen.getByText('Months'));
    await waitFor(() => {
      const months = screen.getAllByRole('button').map(b => b.textContent);
      expect(months.indexOf('一月')).toBeLessThan(months.indexOf('二月'));
    });
  });
});
