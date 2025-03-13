'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateOption {
  value: number
  unit: 'day' | 'week' | 'month' | 'year'
  label: string
}

interface DateRangeSelectorProps {
  onChange?: (option: { value: number, unit: string }) => void
  className?: string
}

export function DateRangeSelector({ onChange, className }: DateRangeSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(7) // Default to 1 month
  
  // Generate date options array
  const dateOptions: DateOption[] = [
    // Days (1-15)
    ...Array.from({ length: 15 }, (_, i) => ({
      value: i + 1,
      unit: 'day' as const,
      label: `${i + 1} ${i === 0 ? 'day' : 'days'}`
    })),
    
    // Weeks (2-8)
    ...Array.from({ length: 7 }, (_, i) => ({
      value: i + 1,
      unit: 'week' as const,
      label: `${i + 1} ${i === 0 ? 'week' : 'weeks'}`
    })),
    
    // Months (1-12)
    ...Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      unit: 'month' as const,
      label: `${i + 1} ${i === 0 ? 'month' : 'months'}`
    })),
    
    // Years (1-5)
    ...Array.from({ length: 5 }, (_, i) => ({
      value: i + 1,
      unit: 'year' as const,
      label: `${i + 1} ${i === 0 ? 'year' : 'years'}`
    }))
  ]
  
  // Notify parent component when selection changes
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < dateOptions.length) {
      const selected = dateOptions[selectedIndex]
      onChange?.({ value: selected.value, unit: selected.unit })
    }
  }, [selectedIndex, dateOptions, onChange])
  
  // Scroll to selected option
  useEffect(() => {
    if (scrollContainerRef.current && selectedIndex >= 0) {
      const container = scrollContainerRef.current
      const selectedElement = container.children[selectedIndex] as HTMLElement
      
      if (selectedElement) {
        const scrollLeft = selectedElement.offsetLeft - (container.clientWidth / 2) + (selectedElement.clientWidth / 2)
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }
  }, [selectedIndex])
  
  // Handle scroll navigation
  const scrollBy = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left'
      ? Math.max(0, selectedIndex - 1)
      : Math.min(dateOptions.length - 1, selectedIndex + 1)
      
    setSelectedIndex(newIndex)
  }
  
  // Format date to show the expected completion date
  const formatExpectedDate = () => {
    const option = dateOptions[selectedIndex]
    const date = new Date()
    
    switch (option.unit) {
      case 'day':
        date.setDate(date.getDate() + option.value)
        break
      case 'week':
        date.setDate(date.getDate() + (option.value * 7))
        break
      case 'month':
        date.setMonth(date.getMonth() + option.value)
        break
      case 'year':
        date.setFullYear(date.getFullYear() + option.value)
        break
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Time to Complete</label>
        <div className="text-sm text-muted-foreground">
          Expected by: <span className="font-medium">{formatExpectedDate()}</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button 
            type="button"
            onClick={() => scrollBy('left')}
            disabled={selectedIndex === 0}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-md disabled:opacity-40"
            aria-label="Previous option"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide py-4 px-10 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dateOptions.map((option, index) => (
            <div
              key={`${option.unit}-${option.value}`}
              className={cn(
                "flex-shrink-0 snap-center px-4 py-2 mx-1 rounded-full cursor-pointer transition-all text-center min-w-[100px]",
                selectedIndex === index
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-muted hover:bg-muted/80"
              )}
              onClick={() => setSelectedIndex(index)}
            >
              {option.label}
            </div>
          ))}
        </div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button 
            type="button"
            onClick={() => scrollBy('right')}
            disabled={selectedIndex === dateOptions.length - 1}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-md disabled:opacity-40"
            aria-label="Next option"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <input 
        type="hidden" 
        name="durationValue" 
        value={dateOptions[selectedIndex]?.value || 1}
      />
      <input 
        type="hidden" 
        name="durationUnit" 
        value={dateOptions[selectedIndex]?.unit || 'month'}
      />
    </div>
  )
} 