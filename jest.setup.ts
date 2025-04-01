import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}), // Mock for empty params by default
}));

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
