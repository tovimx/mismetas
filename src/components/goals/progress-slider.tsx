'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface ProgressSliderProps {
  initialValue?: number
  onChange?: (value: number) => void
}

export function ProgressSlider({ initialValue = 0, onChange }: ProgressSliderProps) {
  const [progress, setProgress] = useState(initialValue)
  const [description, setDescription] = useState('')
  
  useEffect(() => {
    // Update description based on progress
    if (progress === 0) {
      setDescription("Haven't started yet")
    } else if (progress <= 25) {
      setDescription("Just beginning")
    } else if (progress <= 50) {
      setDescription("Making progress")
    } else if (progress <= 75) {
      setDescription("Well underway")
    } else if (progress < 100) {
      setDescription("Almost there")
    } else {
      setDescription("Completed")
    }
  }, [progress])
  
  const handleProgressChange = (values: number[]) => {
    const newValue = values[0]
    setProgress(newValue)
    onChange?.(newValue)
  }
  
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-medium">Current Progress</Label>
        <div className="text-sm text-muted-foreground mt-1">
          How far along are you with this goal?
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <div>0%</div>
          <div>100%</div>
        </div>
        <Slider
          value={[progress]}
          min={0}
          max={100}
          step={5}
          onValueChange={handleProgressChange}
          className="mt-2"
          aria-label="Progress percentage"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {description}
        </div>
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          {progress}%
        </div>
      </div>
    </div>
  )
} 