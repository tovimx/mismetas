'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { addDays, addMonths, addYears, format, endOfYear } from 'date-fns'

// Define the timeframe options with values and descriptive labels
const timeframes = [
  { index: 0, value: { value: 0, unit: 'day' }, label: 'Today', description: 'Start today' },
  { index: 1, value: { value: 3, unit: 'day' }, label: '3 days', description: 'Short-term goal' },
  { index: 2, value: { value: 1, unit: 'week' }, label: '1 week', description: 'Weekly challenge' },
  { index: 3, value: { value: 2, unit: 'week' }, label: '2 weeks', description: 'Biweekly goal' },
  { index: 4, value: { value: 1, unit: 'month' }, label: '1 month', description: 'Monthly objective' },
  { index: 5, value: { value: 3, unit: 'month' }, label: '3 months', description: 'Quarterly goal' },
  { index: 6, value: { value: 6, unit: 'month' }, label: '6 months', description: 'Half-year plan' },
  { index: 7, value: { value: 0, unit: 'end-of-year' }, label: 'End of year', description: 'By December 31st' },
  { index: 8, value: { value: 3, unit: 'year' }, label: '3 years', description: 'Long-term vision' },
  { index: 9, value: { value: 0, unit: 'habit' }, label: 'Daily Habit', description: 'Ongoing practice' }
]

interface TimeframeSliderProps {
  initialValue?: number;
  onChange?: (value: { value: number, unit: string }) => void;
}

export function TimeframeSlider({ onChange }: TimeframeSliderProps) {
  const [sliderValue, setSliderValue] = useState(0);
  
  // Calculate the target date based on selected timeframe
  const getTargetDate = () => {
    const today = new Date();
    const { value, unit } = timeframes[sliderValue].value;
    
    // Special case for "Daily Habit"
    if (unit === 'habit') {
      return 'Ongoing';
    }
    
    // Special case for "End of year"
    if (unit === 'end-of-year') {
      return format(endOfYear(today), 'MMM d, yyyy');
    }
    
    if (unit === 'day') {
      return value === 0 ? 'Today' : format(addDays(today, value), 'MMM d, yyyy');
    } else if (unit === 'week') {
      return format(addDays(today, value * 7), 'MMM d, yyyy');
    } else if (unit === 'month') {
      return format(addMonths(today, value), 'MMM d, yyyy');
    } else if (unit === 'year') {
      return format(addYears(today, value), 'MMM d, yyyy');
    }
    
    return '';
  };
  
  // Update the slider value and notify parent when the slider changes
  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setSliderValue(newValue);
    onChange?.(timeframes[newValue].value);
  };
  
  const currentTimeframe = timeframes[sliderValue];
  
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-medium">Timeframe</Label>
        <div className="text-sm text-muted-foreground mt-1">
          How long will it take to complete this goal?
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <div>Today</div>
          <div>Daily Habit</div>
        </div>
        <Slider
          value={[sliderValue]}
          min={0}
          max={9}
          step={1}
          onValueChange={handleSliderChange}
          className="mt-2"
          aria-label="Timeframe selection"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {currentTimeframe.description}
        </div>
        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          {currentTimeframe.label}
        </div>
      </div>
      
      <div className="flex justify-end">
        <div className="text-sm text-muted-foreground">
          Target completion: <span className="font-medium">{getTargetDate()}</span>
        </div>
      </div>
    </div>
  );
} 