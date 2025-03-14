'use client'

import { useState, useEffect, memo, useMemo, useCallback, useTransition, useRef } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createGoal, type GoalFormState } from '@/app/actions/goal-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProgressSlider } from './progress-slider'
import { TimeframeSlider } from './timeframe-slider'
import { PlusIcon, XIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'

const initialState: GoalFormState = {}

interface InlineGoalCreationProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export function InlineGoalCreation({ 
  onOpenChange,
}: InlineGoalCreationProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [state, formAction] = useActionState(createGoal, initialState)
  
  const [formData, setFormData] = useState({
    title: '',
    progress: 0,
    duration: { value: 0, unit: 'day' }
  })
  
  
  const handleGoalTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }))
  }, []);
  
  const handleProgressChange = useCallback((progress: number) => {
    setFormData(prev => ({ ...prev, progress }))
  }, []);
  
  const handleTimeframeChange = useCallback((duration: { value: number, unit: string }) => {
    setFormData(prev => ({ ...prev, duration }))
  }, []);
  
  const nextStep = useCallback(() => {
    setStep(prev => prev + 1)
  }, []);
  
  const prevStep = useCallback(() => {
    setStep(prev => Math.max(1, prev - 1))
  }, []);
  
  const resetForm = useCallback(() => {
    setStep(1)
    setFormData({ 
      title: '', 
      progress: 0,
      duration: { value: 0, unit: 'day' }
    })
  }, []);
  
  const handleCancel = useCallback(() => {
    resetForm()
    onOpenChange?.(false)
  }, [resetForm, onOpenChange]);
  
  const handleOpenClick = useCallback(() => {
    onOpenChange?.(true)
  }, [onOpenChange]);
  
  // Use React's useTransition for better UX during form submission
  const handleSubmit = (async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('handleSubmit', e);
    e.preventDefault();
    addToast({
      title: 'Success!',
      description: 'Operation test',
      variant: 'success',
    })
  });
  
  // Use a local success state to prevent infinite loop
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);
  
  // Handle successful goal creation with useEffect
  // useEffect(() => {
  //   // Only process success state once
  //   if (state.success && !hasProcessedSuccess) {
  //     setHasProcessedSuccess(true);
      
  //     addToast({
  //       title: "Goal created successfully!",
  //       description: `Your goal "${formData.title}" has been created.`,
  //       variant: "success",
  //     });
      
  //     // First close the form to unmount the TimeframeSlider
  //     setIsOpen(false);
      
  //     // Use setTimeout to ensure the component has time to unmount before resetting state
  //     setTimeout(() => {
  //       resetForm();
  //       router.refresh();
  //     }, 0);
  //   }
  // }, [state.success, router, resetForm, addToast, formData.title, hasProcessedSuccess]);
  
  // Reset the success state tracking when state.success becomes false
  // useEffect(() => {
  //   if (!state.success && hasProcessedSuccess) {
  //     setHasProcessedSuccess(false);
  //   }
  // }, [state.success, hasProcessedSuccess]);
  
  // Handle error notifications separately
  // useEffect(() => {
  //   if (state.errors && Object.keys(state.errors).length > 0) {
  //     // Show error toast if there are validation errors
  //     const errorMessage = state.errors._form 
  //       ? state.errors._form[0] 
  //       : "There was an error creating your goal. Please check the form and try again.";
        
  //     addToast({
  //       title: "Failed to create goal",
  //       description: errorMessage,
  //       variant: "error",
  //     });
  //   }
  // }, [state.errors, addToast]);
  
  // Memoize the steps to prevent unnecessary re-renders
  const steps = useMemo(() => [
    { id: 1, label: 'Goal' },
    { id: 2, label: 'Progress' },
    { id: 3, label: 'Timeline' }
  ], []);
  
  // Memoize the step title for better performance
  const stepTitle = useMemo(() => {
    if (step === 1) return 'What is your goal?'
    if (step === 2) return 'Track your progress'
    return 'When do you want to complete it?'
  }, [step]);
  
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
                    ${step >= s.id 
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
                  <div className="flex-1 h-[2px] w-12 mx-1 sm:mx-2 
                    bg-gradient-to-r 
                    from-primary to-primary 
                    dark:from-primary dark:to-primary"
                    style={{
                      backgroundSize: `${step > s.id ? '100%' : '0%'} 100%`,
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: 'hsl(var(--muted))'
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!formData.title.trim()}
                  >
                    Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Progress Slider */}
          {step === 2 && (
            <div className="space-y-4">
              <ProgressSlider 
                initialValue={formData.progress} 
                onChange={handleProgressChange}
              />
              
              <input 
                type="hidden" 
                name="progress" 
                value={formData.progress} 
              />
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Timeframe Slider */}
          {step === 3 && (
            <div className="space-y-4">
              <input type="hidden" name="title" value={formData.title} />
              <input type="hidden" name="progress" value={formData.progress} />
              <input type="hidden" name="durationValue" value={formData.duration.value} />
              <input type="hidden" name="durationUnit" value={formData.duration.unit} />
              
              {/* Use a static key to prevent unnecessary remounting */}
              <TimeframeSlider 
                initialValue={0} // Default to Today
                onChange={handleTimeframeChange}
                key="timeframe-slider-static"
              />
              
              {state.errors?._form && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {state.errors._form.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
  )
} 