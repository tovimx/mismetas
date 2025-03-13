'use client'

import { useState, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createGoal, type GoalFormState } from '@/app/actions/goal-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProgressSlider } from './progress-slider'
import { TimeframeSlider } from './timeframe-slider'
import { PlusIcon, XIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'

const initialState: GoalFormState = {}

interface InlineGoalCreationProps {
  onOpenChange?: (isOpen: boolean) => void;
  setInitiallyOpen?: boolean;
}

export function InlineGoalCreation({ 
  onOpenChange,
  setInitiallyOpen = false 
}: InlineGoalCreationProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(setInitiallyOpen)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [state, formAction] = useFormState(createGoal, initialState)
  
  const [formData, setFormData] = useState({
    title: '',
    progress: 0,
    duration: { value: 0, unit: 'day' }
  })
  
  // Notify parent component when isOpen changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  
  const handleGoalTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }))
  }
  
  const handleProgressChange = (progress: number) => {
    setFormData(prev => ({ ...prev, progress }))
  }
  
  const handleTimeframeChange = (duration: { value: number, unit: string }) => {
    setFormData(prev => ({ ...prev, duration }))
  }
  
  const nextStep = () => {
    setStep(prev => prev + 1)
  }
  
  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1))
  }
  
  const handleCancel = () => {
    setIsOpen(false)
    setStep(1)
    setFormData({ 
      title: '', 
      progress: 0,
      duration: { value: 0, unit: 'day' }
    })
  }
  
  const handleOpenClick = () => {
    // Update parent state first, then open the form
    onOpenChange?.(true);
    setIsOpen(true)
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formElement = e.currentTarget
    const formDataObj = new FormData(formElement)
    await formAction(formDataObj)
    
    setIsSubmitting(false)
  }
  
  // If goal was created successfully, close the form and refresh
  if (state.success) {
    setIsOpen(false)
    setStep(1)
    setFormData({ 
      title: '', 
      progress: 0,
      duration: { value: 0, unit: 'day' }
    })
    router.refresh()
    // Reset state for next time
    state.success = false
  }
  
  if (!isOpen) {
    return (
      <Button 
        onClick={handleOpenClick}
        className="flex items-center justify-center gap-2"
        variant="outline"
        size="sm"
      >
        <PlusIcon className="h-4 w-4" />
        Create goal
      </Button>
    )
  }
  
  const steps = [
    { id: 1, label: 'Goal' },
    { id: 2, label: 'Progress' },
    { id: 3, label: 'Timeline' }
  ]
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {step === 1 ? 'What is your goal?' : 
           step === 2 ? 'Track your progress' : 
           'When do you want to complete it?'}
        </h3>
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
                    Back
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
              
              <TimeframeSlider 
                initialValue={0} // Default to Today
                onChange={handleTimeframeChange}
                key="timeframe-slider"
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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