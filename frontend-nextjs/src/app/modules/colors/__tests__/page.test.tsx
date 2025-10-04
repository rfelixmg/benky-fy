/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ColorModule from '../page';

describe('ColorModule', () => {
  const mockData = {
    colors: [
      { kanji: '赤', hiragana: 'あか', english: 'red', hex: '#ff0000' },
      { kanji: '青', hiragana: 'あお', english: 'blue', hex: '#0000ff' },
    ]
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    ) as jest.Mock;
  });

  it('should show loading state initially', () => {
    render(<ColorModule />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render colors after loading', async () => {
    await act(async () => {
      render(<ColorModule />);
    });

    await waitFor(() => {
      expect(screen.getByText('Japanese Colors')).toBeInTheDocument();
      expect(screen.getByText('赤')).toBeInTheDocument();
      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.getByText('red')).toBeInTheDocument();
    });
  });

  it('should track color selection', async () => {
    await act(async () => {
      render(<ColorModule />);
    });

    await waitFor(() => {
      expect(screen.getByText('Colors viewed:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    const redButton = screen.getByText('赤').closest('button');
    expect(redButton).toBeInTheDocument();

    await act(async () => {
      redButton?.click();
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('red')).toBeInTheDocument();
    expect(redButton).toHaveClass('ring-2');
  });

  it('should handle API errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    await act(async () => {
      render(<ColorModule />);
    });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});