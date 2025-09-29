import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { FlashcardDisplay } from '@/components/flashcard/FlashcardDisplay';
import { ProgressTracker } from '@/components/flashcard/ProgressTracker';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Auth Flow', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (useRouter as jest.Mock).mockClear();
  });

  it('handles successful test login', async () => {
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        headers: new Headers({
          'set-cookie': 'session=test-session',
        }),
      })
    );

    render(<LoginPage />);
    
    const loginButton = screen.getByText(/Development Test Login/i);
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/test-login'),
        expect.any(Object)
      );
    });
  });

  it('handles failed login gracefully', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Login failed' }),
      })
    );

    render(<LoginPage />);
    
    const loginButton = screen.getByText(/Development Test Login/i);
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });
});

describe('Flashcard Component', () => {
  const mockQuestion = 'Test Question';
  const mockAnswer = 'Test Answer';
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    mockOnAnswer.mockClear();
  });

  it('displays question and handles correct answer', async () => {
    render(
      <FlashcardDisplay
        question={mockQuestion}
        answer={mockAnswer}
        onAnswer={mockOnAnswer}
      />
    );

    expect(screen.getByText(mockQuestion)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/Type your answer/i);
    await userEvent.type(input, mockAnswer);
    
    const submitButton = screen.getByText(/Check Answer/i);
    await userEvent.click(submitButton);

    expect(mockOnAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });

  it('handles incorrect answers appropriately', async () => {
    render(
      <FlashcardDisplay
        question={mockQuestion}
        answer={mockAnswer}
        onAnswer={mockOnAnswer}
      />
    );

    const input = screen.getByPlaceholderText(/Type your answer/i);
    await userEvent.type(input, 'Wrong Answer');
    
    const submitButton = screen.getByText(/Check Answer/i);
    await userEvent.click(submitButton);

    expect(mockOnAnswer).toHaveBeenCalledWith(false);
    expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();
    expect(screen.getByText(mockAnswer)).toBeInTheDocument();
  });
});

describe('Progress Tracking', () => {
  const mockStats = {
    total: 10,
    completed: 5,
    correct: 4,
    streak: 2,
  };

  it('displays progress stats correctly', () => {
    render(<ProgressTracker stats={mockStats} />);

    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument(); // Accuracy
    expect(screen.getByText('2')).toBeInTheDocument(); // Streak
    expect(screen.getByText('4')).toBeInTheDocument(); // Total Correct
  });

  it('handles zero completed cards', () => {
    render(
      <ProgressTracker
        stats={{
          ...mockStats,
          completed: 0,
          correct: 0,
        }}
      />
    );

    expect(screen.getByText('0/10')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
