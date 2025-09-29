import '@testing-library/jest-dom';

// Mock SWR hooks
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    track: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
  usePathname: jest.fn(),
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
  useAnimation: () => ({
    start: jest.fn(),
  }),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
