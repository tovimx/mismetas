'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createGoalWithTasks } from '@/app/actions/goal-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeframeSlider } from './timeframe-slider';
import { TargetOptionSlider, type TargetOption } from './target-option-slider';
import { XIcon, ArrowRightIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';
import { AiPlanConfirmationModal } from './ai-plan-confirmation-modal';
import { addDays, addWeeks, addMonths, addYears, endOfYear } from 'date-fns';

interface AiPlan {
  tasks: { title: string }[];
  suggestions: string[];
}

interface ActionResponseState {
  success?: boolean;
  errors?: {
    _form?: string[];
    title?: string[];
  };
}

interface InlineGoalCreationProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export function InlineGoalCreation({ onOpenChange }: InlineGoalCreationProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTargetOptionsLoading, setIsTargetOptionsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: { value: 0, unit: 'day' },
  });

  const [aiTargetOptions, setAiTargetOptions] = useState<TargetOption[] | null>(null);
  const [selectedTargetValue, setSelectedTargetValue] = useState<number>(100);
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalBaseFormData, setFinalBaseFormData] = useState<{
    title: string;
    description: string;
    duration: { value: number; unit: string };
  } | null>(null);

  const handleGoalTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleTimeframeChange = useCallback((duration: { value: number; unit: string }) => {
    setFormData(prev => ({ ...prev, duration }));
  }, []);

  const handleTargetSelectionChange = useCallback((selectedValue: number) => {
    setSelectedTargetValue(selectedValue);
  }, []);

  const steps = useMemo(
    () => [
      { id: 1, label: 'Goal' },
      { id: 2, label: 'Target' },
      { id: 3, label: 'Timeline' },
    ],
    []
  );

  const totalSteps = steps.length;

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleFetchTargetOptions = useCallback(async () => {
    if (!formData.title.trim()) {
      addToast({
        title: 'Error',
        description: 'Please enter a goal title first.',
        variant: 'error',
      });
      return;
    }
    setIsTargetOptionsLoading(true);
    setAiTargetOptions(null);
    try {
      const response = await fetch('/api/ai/suggest-target-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalName: formData.title,
          goalDescription: formData.description,
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch target options');
      const data = await response.json();
      setAiTargetOptions(data.options || []);
      if (data.options && data.options.length > 0) {
        setSelectedTargetValue(data.options[0].value);
      }
      setStep(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching target options:', error);

      let errorDescription = 'Could not fetch target suggestions from the AI.';
      // Try to parse specific error details from the API response
      if (error instanceof Error && (error as any).response) {
        try {
          const errorData = await (error as any).response.json();
          if (errorData && errorData.details) {
            errorDescription = errorData.details;
          }
        } catch (jsonError) {
          console.error('Failed to parse error response JSON:', jsonError);
          // Use default error message if JSON parsing fails
        }
      } else if (error instanceof Error) {
        errorDescription = error.message; // Use generic error message if not a response error
      }

      addToast({
        title: 'AI Error',
        description: errorDescription, // Use the specific or fallback message
        variant: 'error',
      });
      setAiTargetOptions([]); // Still show empty options / allow proceeding
      setStep(prev => prev + 1); // Allow user to proceed even if AI suggestions fail
    } finally {
      setIsTargetOptionsLoading(false);
    }
  }, [formData.title, formData.description, addToast]);

  const resetForm = useCallback(() => {
    setStep(1);
    setFormData({ title: '', description: '', duration: { value: 0, unit: 'day' } });
    setAiTargetOptions(null);
    setSelectedTargetValue(100);
    setAiPlan(null);
    setIsModalOpen(false);
    setFinalBaseFormData(null);
  }, []);

  const handleCancel = useCallback(() => {
    resetForm();
    onOpenChange?.(false);
  }, [resetForm, onOpenChange]);

  const handleInitiateAiPlan = useCallback(async () => {
    setFinalBaseFormData({
      title: formData.title,
      description: formData.description,
      duration: formData.duration,
    });
    setIsAiLoading(true);
    setAiPlan(null);

    let targetDateISO: string | undefined = undefined;
    if (formData.duration.value > 0) {
      const today = new Date();
      let calculatedDate: Date;
      const { value, unit } = formData.duration;
      switch (unit) {
        case 'day':
          calculatedDate = addDays(today, value);
          break;
        case 'week':
          calculatedDate = addWeeks(today, value);
          break;
        case 'month':
          calculatedDate = addMonths(today, value);
          break;
        case 'year':
          calculatedDate = addYears(today, value);
          break;
        case 'end-of-year':
          calculatedDate = endOfYear(today);
          break;
        default:
          calculatedDate = today;
      }
      if (unit !== 'habit') {
        targetDateISO = calculatedDate.toISOString();
      }
    }

    try {
      const response = await fetch('/api/ai/generate-goal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalName: formData.title,
          goalDescription: formData.description,
          goalTarget: selectedTargetValue,
          targetDate: targetDateISO,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `AI Plan API failed`);
      }

      const plan: AiPlan = await response.json();
      setAiPlan(plan);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating AI plan:', error);
      addToast({
        title: 'AI Plan Error',
        description: error instanceof Error ? error.message : 'Could not generate plan.',
        variant: 'error',
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [formData, selectedTargetValue, addToast]);

  const handleAcceptAndSave = useCallback(async () => {
    if (!finalBaseFormData || !aiPlan || selectedTargetValue === null) return;

    setIsModalOpen(false);
    setIsSaving(true);

    let targetDateForDb: Date | undefined | null = undefined;
    if (finalBaseFormData.duration.value > 0) {
      const today = new Date();
      let calculatedDate: Date;
      const { value, unit } = finalBaseFormData.duration;
      switch (unit) {
        case 'day':
          calculatedDate = addDays(today, value);
          break;
        case 'week':
          calculatedDate = addWeeks(today, value);
          break;
        case 'month':
          calculatedDate = addMonths(today, value);
          break;
        case 'year':
          calculatedDate = addYears(today, value);
          break;
        case 'end-of-year':
          calculatedDate = endOfYear(today);
          break;
        default:
          calculatedDate = today;
      }
      targetDateForDb = unit === 'habit' ? null : calculatedDate;
    } else {
      targetDateForDb = null;
    }

    const goalPayload = {
      title: finalBaseFormData.title,
      description: finalBaseFormData.description,
      target: selectedTargetValue,
      targetDate: targetDateForDb,
      tasks: aiPlan.tasks.map(task => ({ title: task.title })),
    };

    startTransition(async () => {
      try {
        const result: ActionResponseState = await createGoalWithTasks(goalPayload);

        if (result.success) {
          addToast({
            title: 'Goal Created',
            description: `Your goal "${finalBaseFormData.title}" and its AI plan have been created.`,
            variant: 'success',
          });
          onOpenChange?.(false);
          resetForm();
          router.refresh();
        } else {
          const errorMessages = Object.values(result.errors ?? {}).flat();
          const formError = result.errors?._form?.join('. ') || '';
          addToast({
            title: 'Save Error',
            description:
              errorMessages.length > 0
                ? errorMessages.join('. ')
                : formError || 'Failed to save the goal.',
            variant: 'error',
          });
          console.error('Server action failed:', result.errors);
        }
      } catch (error) {
        console.error('Error calling server action:', error);
        addToast({
          title: 'Error',
          description: 'An unexpected error occurred while saving your goal.',
          variant: 'error',
        });
      } finally {
        setIsSaving(false);
      }
    });
  }, [finalBaseFormData, aiPlan, selectedTargetValue, addToast, router, resetForm, onOpenChange]);

  const stepTitle = useMemo(() => {
    if (step === 1) return 'What is your goal?';
    if (step === 2) return 'Select a target for your goal';
    return 'When do you want to complete it?';
  }, [step]);

  const isFinalStep = step === totalSteps;
  const mainButtonDisabled = isPending || isAiLoading || isSaving || isTargetOptionsLoading;

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
          disabled={mainButtonDisabled}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-center w-full mb-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
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
              <span
                className={`hidden sm:block text-sm mx-2 
                  ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {s.label}
              </span>
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

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Goal Title<span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Run a 10k race"
                required
                value={formData.title}
                onChange={handleGoalTitleChange}
                disabled={mainButtonDisabled}
                className="text-lg py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Add some details about why this goal is important..."
                value={formData.description}
                onChange={handleDescriptionChange}
                disabled={mainButtonDisabled}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 min-h-[150px]">
            {isTargetOptionsLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TargetOptionSlider
                options={aiTargetOptions || []}
                onChange={handleTargetSelectionChange}
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <TimeframeSlider onChange={handleTimeframeChange} />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={mainButtonDisabled}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={
              step === 1
                ? handleFetchTargetOptions
                : isFinalStep
                  ? handleInitiateAiPlan
                  : () => setStep(s => s + 1)
            }
            disabled={mainButtonDisabled || (step === 1 && !formData.title.trim())}
          >
            {step === 1 && isTargetOptionsLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {step === totalSteps && isAiLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {step === 1
              ? 'Next'
              : isFinalStep
                ? isAiLoading
                  ? 'Generating Plan...'
                  : 'Generate Plan & Review'
                : 'Next'}
            {step < totalSteps && <ArrowRightIcon className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>

      <AiPlanConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        plan={aiPlan}
        onAccept={handleAcceptAndSave}
        isLoading={isSaving}
      />
    </div>
  );
}
