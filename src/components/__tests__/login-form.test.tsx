// Import testing utilities
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component to test
import { LoginForm } from '../login-form';

// Import dependencies that need to be mocked
import { signIn } from 'next-auth/react';

// Mock external dependencies
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Group related tests using describe
describe('LoginForm', () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // First test: verify the component renders correctly
  it('renders login form correctly', () => {
    // Arrange: Render the component
    render(<LoginForm />);

    // Assert: Check if important elements are rendered
    expect(screen.getByText('Welcome to MisMetas')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    expect(screen.getByText(/By continuing, you agree to our/i)).toBeInTheDocument();
  });

  // Second test: verify loading state during sign-in
  it('shows loading state when signing in', async () => {
    // Arrange: Mock the signIn function to delay resolution
    const signInMock = signIn as jest.Mock;
    signInMock.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    // Render the component
    render(<LoginForm />);

    // Set up user event for interactions
    const user = userEvent.setup();

    // Act: Click the sign in button
    await user.click(screen.getByRole('button', { name: /Sign in with Google/i }));

    // Assert: Check if loading state is shown
    expect(screen.getByText('Signing in...')).toBeInTheDocument();

    // Also verify the signIn function was called with correct parameters
    expect(signInMock).toHaveBeenCalledWith('google', {
      redirectTo: '/dashboard',
    });
  });

  // Third test: verify error handling
  it('shows error message when sign in fails', async () => {
    // Arrange: Mock the signIn function to reject with an error
    const signInMock = signIn as jest.Mock;
    signInMock.mockRejectedValue(new Error('Error signing in'));

    // Render the component
    render(<LoginForm />);

    // Set up user event for interactions
    const user = userEvent.setup();

    // Act: Click the sign in button
    await user.click(screen.getByRole('button', { name: /Sign in with Google/i }));

    // Assert: Check if error message is shown
    // Using findByText for async appearance of error message
    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });
});
