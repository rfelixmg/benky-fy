import { ReactNode } from 'react';
import { render } from '@testing-library/react';

interface WrapperProps {
  children: ReactNode;
}

export function renderWithProviders(ui: ReactNode) {
  return render(ui, {
    wrapper: ({ children }: WrapperProps) => (
      <>{children}</>
    ),
  });
}

export function mockFlashcard(overrides = {}) {
  return {
    id: 'test-1',
    prompt: 'こんにちは',
    answer: 'Hello',
    prompt_script: 'hiragana',
    furigana_html: '<ruby>今日<rt>きょう</rt></ruby>は',
    ...overrides,
  };
}

export function mockModuleData(overrides = {}) {
  return {
    id: 'hiragana',
    name: 'Hiragana',
    description: 'Learn basic hiragana',
    total_cards: 46,
    completed: 0,
    ...overrides,
  };
}

export const mockAnalytics = {
  track: jest.fn(),
};
