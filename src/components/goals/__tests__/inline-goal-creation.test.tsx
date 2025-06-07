import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineGoalCreation } from '../inline-goal-creation';
import * as goalsApi from '@/lib/api/services/goals';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toaster';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/ui/toaster', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/lib/api/services/goals', () => ({
  validateGoal: jest.fn(),
  generateGoalPlan: jest.fn(),
  getTargetOptions: jest.fn(),
}));

// Mock the server action
jest.mock('@/app/actions/goal-actions', () => ({
  createGoalWithTasks: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('InlineGoalCreation - Goal Validation', () => {
  const mockRouter = { refresh: jest.fn() };
  const mockAddToast = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast });
    
    // Default mock implementations
    (goalsApi.validateGoal as jest.Mock).mockResolvedValue({ isValid: true });
    (goalsApi.getTargetOptions as jest.Mock).mockResolvedValue({ 
      options: [
        { value: 10, label: '10 minutes daily' },
        { value: 30, label: '30 minutes daily' },
      ] 
    });
    (goalsApi.generateGoalPlan as jest.Mock).mockResolvedValue({
      tasks: [{ title: 'Task 1' }, { title: 'Task 2' }],
      suggestions: ['Tip 1', 'Tip 2'],
    });
  });

  afterEach(async () => {
    // Wait for any pending promises
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Client-side validation', () => {
    test('shows idle state when input is empty', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      
      // Initially empty
      expect(input).toHaveValue('');
      expect(screen.queryByText(/Please provide more detail/i)).not.toBeInTheDocument();
      
      // Type and clear
      await user.type(input, 'test');
      await user.clear(input);
      
      // Should return to idle state
      expect(screen.queryByText(/Please provide more detail/i)).not.toBeInTheDocument();
    });

    test('shows error for goals shorter than 10 characters', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'short');
      
      expect(screen.getByText(/Too short! Add more detail/i)).toBeInTheDocument();
      
      // Next button should be disabled
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    test('shows error for input without action verbs', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'aaaaaaaaaa'); // 10 chars but no action verb
      
      expect(screen.getByText(/Try: Learn, Build, Run, or Create/i)).toBeInTheDocument();
    });

    test('shows valid state for proper goals without AI validation', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'learn code'); // Exactly 10 chars with action verb
      
      // Should show valid immediately (before AI validation)
      await waitFor(() => {
        expect(screen.queryByText(/Too short/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Try: Learn, Build/i)).not.toBeInTheDocument();
      });
      
      // Next button should be enabled
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();
    });
  });

  describe('AI validation integration', () => {
    test('triggers AI validation for valid goals > 10 characters after debounce', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'learn to code');
      
      // AI validation should not be called immediately
      expect(goalsApi.validateGoal).not.toHaveBeenCalled();
      
      // Fast-forward past debounce time
      act(() => {
        jest.advanceTimersByTime(800);
      });
      
      await waitFor(() => {
        expect(goalsApi.validateGoal).toHaveBeenCalledWith('learn to code');
      });
    });

    test('shows loading spinner during AI validation', async () => {
      // Make AI validation take some time
      (goalsApi.validateGoal as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ isValid: true }), 100))
      );
      
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'learn to code');
      
      // Trigger AI validation
      act(() => {
        jest.advanceTimersByTime(800);
      });
      
      // Should show spinner
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
      
      // Complete the validation
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    test('shows valid state when AI approves the goal', async () => {
      (goalsApi.validateGoal as jest.Mock).mockResolvedValue({ isValid: true });
      
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'run a marathon');
      
      act(() => {
        jest.advanceTimersByTime(800);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('valid-checkmark')).toBeInTheDocument();
      });
    });

    test('shows error with AI feedback when goal is rejected', async () => {
      (goalsApi.validateGoal as jest.Mock).mockResolvedValue({ 
        isValid: false,
        feedback: 'This goal is too vague. Try being more specific about what you want to achieve.'
      });
      
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'do something'); // This will fail client validation first
      
      // Since "do something" fails client validation, we need a goal that passes client but fails AI
      await user.clear(input);
      await user.type(input, 'learn things'); // Has verb, > 10 chars
      
      act(() => {
        jest.advanceTimersByTime(800);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/This goal is too vague/i)).toBeInTheDocument();
      });
    });

    test('falls back to client validation when AI request fails', async () => {
      (goalsApi.validateGoal as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'learn spanish');
      
      act(() => {
        jest.advanceTimersByTime(800);
      });
      
      // Should still show as valid (client validation passed)
      await waitFor(() => {
        expect(screen.queryByText(/Too short/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Try: Learn, Build/i)).not.toBeInTheDocument();
      });
    });

    test('cancels pending validation on new input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'learn spanish');
      
      // Wait 400ms (half of debounce time)
      act(() => {
        jest.advanceTimersByTime(400);
      });
      
      // Type more
      await user.type(input, ' fluently');
      
      // Complete first debounce
      act(() => {
        jest.advanceTimersByTime(400);
      });
      
      // Should not have called validation yet
      expect(goalsApi.validateGoal).not.toHaveBeenCalled();
      
      // Complete second debounce
      act(() => {
        jest.advanceTimersByTime(800);
      });
      
      // Should only validate once with final value
      await waitFor(() => {
        expect(goalsApi.validateGoal).toHaveBeenCalledTimes(1);
        expect(goalsApi.validateGoal).toHaveBeenCalledWith('learn spanish fluently');
      });
    });
  });

  describe('Form submission', () => {
    test('disables Next button when goal is invalid', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      // Invalid goal
      await user.type(input, 'xyz');
      expect(nextButton).toBeDisabled();
    });

    test('enables Next button when goal is valid', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      await user.type(input, 'learn to play guitar');
      expect(nextButton).toBeEnabled();
    });

    test('preserves validation state through form steps', async () => {
      const user = userEvent.setup({ delay: null });
      render(<InlineGoalCreation onOpenChange={mockOnOpenChange} />);
      
      // Enter valid goal
      const input = screen.getByPlaceholderText(/learn to play guitar/i);
      await user.type(input, 'learn to play guitar');
      
      // Go to next step
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      // Wait for target options to load
      await waitFor(() => {
        expect(screen.getByText(/Select a target for your goal/i)).toBeInTheDocument();
      });
      
      // Go back
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);
      
      // Goal should still be there and valid
      expect(input).toHaveValue('learn to play guitar');
      expect(nextButton).toBeEnabled();
    });
  });
});

// Helper to find spinner - add data-testid to component
// Helper to find checkmark - add data-testid to component