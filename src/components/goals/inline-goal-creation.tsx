'use client';

import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createGoal, type GoalFormState } from '@/app/actions/goal-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressSlider } from './progress-slider';
import { TimeframeSlider } from './timeframe-slider';
import { XIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';

const initialState: GoalFormState = {};

interface InlineGoalCreationProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export function InlineGoalCreation({ onOpenChange }: InlineGoalCreationProps) {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createGoal, initialState);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    progress: 0,
    targetValue: 100,
    duration: { value: 0, unit: 'day' },
  });

  const router = useRouter();

  // Add state to track if success has been handled to avoid multiple processing
  const [successHandled, setSuccessHandled] = useState(false);

  const handleGoalTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleProgressChange = useCallback((progress: number) => {
    setFormData(prev => ({ ...prev, progress }));
  }, []);

  const handleTimeframeChange = useCallback((duration: { value: number; unit: string }) => {
    setFormData(prev => ({ ...prev, duration }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(1, prev - 1));
  }, []);

  const resetForm = useCallback(() => {
    setStep(1);
    setFormData({
      title: '',
      description: '',
      progress: 0,
      targetValue: 100,
      duration: { value: 0, unit: 'day' },
    });
    setSuccessHandled(false);
  }, []);

  const handleCancel = useCallback(() => {
    resetForm();
    onOpenChange?.(false);
  }, [resetForm, onOpenChange]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Indicate loading state
      startTransition(() => {
        try {
          const formElement = e.currentTarget;
          const formData = new FormData(formElement);

          // Ensure targetValue is positive
          if (!formData.get('targetValue') || Number(formData.get('targetValue')) <= 0) {
            formData.set('targetValue', '100'); // Set default if missing or invalid
          }

          // Submit the form data to the server action
          formAction(formData);
        } catch (error) {
          console.error('Error submitting form:', error);
          addToast({
            title: 'Error',
            description: 'An unexpected error occurred while creating your goal.',
            variant: 'error',
          });
        }
      });
    },
    [addToast, startTransition, formAction]
  );

  const steps = useMemo(
    () => [
      { id: 1, label: 'Goal' },
      { id: 2, label: 'Progress' },
      { id: 3, label: 'Timeline' },
    ],
    []
  );

  const stepTitle = useMemo(() => {
    if (step === 1) return 'What is your goal?';
    if (step === 2) return 'Track your progress';
    return 'When do you want to complete it?';
  }, [step]);

  useEffect(() => {
    if (state.success && !successHandled) {
      setSuccessHandled(true);

      // First close the form immediately
      onOpenChange?.(false);

      // Then show the success toast
      addToast({
        title: 'Goal Created',
        description: `Your goal "${formData.title}" has been created successfully.`,
        variant: 'success',
      });

      // Reset form state and refresh the page to show the new goal
      resetForm();
      router.refresh();
    } else if (state.errors) {
      console.error('Goal creation failed with errors:', state.errors);

      // Check for specific field errors to provide more helpful messages
      const errorMessages = [];

      if (state.errors.title) {
        errorMessages.push(`Title: ${state.errors.title[0]}`);
      }
      if (state.errors.description) {
        errorMessages.push(`Description: ${state.errors.description[0]}`);
      }
      if (state.errors.targetValue) {
        errorMessages.push(`Target Value: ${state.errors.targetValue[0]}`);
      }
      if (state.errors._form) {
        errorMessages.push(...state.errors._form);
      }

      const errorMessage =
        errorMessages.length > 0 ? errorMessages.join('. ') : 'Please check the form for errors.';

      addToast({
        title: 'Validation Error',
        description: errorMessage,
        variant: 'error',
      });
    }

    // Reset successHandled when the component unmounts or when state changes
    return () => {
      if (successHandled) {
        setSuccessHandled(false);
      }
    };
  }, [state, addToast, formData.title, router, resetForm, onOpenChange, successHandled]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{stepTitle}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
          aria-label="Close form"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Horizontal Stepper */}
          <div className="flex items-center justify-center w-full mb-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                {/* Step Circle with Number */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${
                      step >= s.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    } font-medium text-sm transition-colors`}
                >
                  {s.id}
                </div>

                {/* Step Label */}
                <span
                  className={`hidden sm:block text-sm mx-2 
                    ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {s.label}
                </span>

                {/* Connector Line (except after last step) */}
                {i < steps.length - 1 && (
                  <div
                    className="flex-1 h-[2px] w-12 mx-1 sm:mx-2 
                    bg-gradient-to-r 
                    from-primary to-primary 
                    dark:from-primary dark:to-primary"
                    style={{
                      backgroundSize: `${step > s.id ? '100%' : '0%'} 100%`,
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: 'hsl(var(--muted))',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Goal Title */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Goal Title<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Learn React"
                  required
                  value={formData.title}
                  onChange={handleGoalTitleChange}
                  aria-describedby="title-error"
                  className="text-lg py-6"
                  autoFocus
                />
                {state.errors?.title && (
                  <p id="title-error" className="text-sm text-destructive">
                    {state.errors.title[0]}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={nextStep} disabled={!formData.title.trim()}>
                    Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Progress Slider */}
          {step === 2 && (
            <div className="space-y-4">
              <ProgressSlider initialValue={formData.progress} onChange={handleProgressChange} />

              <input type="hidden" name="progress" value={formData.progress} />

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Timeframe Slider */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Hidden fields to collect all form data */}
              <input type="hidden" name="title" value={formData.title} />
              <input type="hidden" name="description" value={formData.description || ''} />
              <input type="hidden" name="progress" value={formData.progress} />
              <input type="hidden" name="targetValue" value={formData.targetValue || 100} />
              <input type="hidden" name="durationValue" value={formData.duration.value} />
              <input type="hidden" name="durationUnit" value={formData.duration.unit} />

              {/* Use a static key to prevent unnecessary remounting */}
              <TimeframeSlider onChange={handleTimeframeChange} key="timeframe-slider-static" />

              {/* Display field-specific validation errors */}
              {(state.errors?.description || state.errors?.targetValue) && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md space-y-1">
                  {state.errors?.description && <p>{state.errors.description[0]}</p>}
                  {state.errors?.targetValue && <p>{state.errors.targetValue[0]}</p>}
                </div>
              )}

              {/* Display form-level errors */}
              {state.errors?._form && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {state.errors._form.map(error => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Create Goal
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
