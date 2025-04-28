'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Export the interface
export interface TargetOption {
  value: number;
  label: string;
  description?: string;
}

interface TargetOptionSliderProps {
  options: TargetOption[];
  // Callback provides the selected target VALUE, not the index
  onChange: (selectedValue: number) => void;
  initialIndex?: number; // Optional: start at a specific option
  disabled?: boolean;
}

export function TargetOptionSlider({
  options,
  onChange,
  initialIndex = 0, // Default to the first option
  disabled = false,
}: TargetOptionSliderProps) {
  // Ensure initialIndex is valid
  const validInitialIndex = Math.max(0, Math.min(initialIndex, options.length - 1));
  const [selectedIndex, setSelectedIndex] = useState(validInitialIndex);

  // Update parent component when index changes
  useEffect(() => {
    if (options.length > 0 && selectedIndex >= 0 && selectedIndex < options.length) {
      onChange(options[selectedIndex].value);
    }
    // Only trigger onChange when selectedIndex or options array itself changes reference
  }, [selectedIndex, options, onChange]);

  // Reset index if options change externally and index becomes invalid
  useEffect(() => {
    if (selectedIndex >= options.length) {
      setSelectedIndex(Math.max(0, options.length - 1));
    }
  }, [options, selectedIndex]);

  // Handler for the underlying shadcn slider
  const handleSliderChange = (values: number[]) => {
    const newIndex = values[0];
    setSelectedIndex(newIndex);
    // We trigger the actual 'onChange' with the *value* in the useEffect hook
  };

  // Handle cases with no options
  if (!options || options.length === 0) {
    return (
      <div className="space-y-2 text-center py-4">
        <p className="text-sm text-muted-foreground italic">
          Could not generate specific target options for this goal.
        </p>
        {/* Optionally add a manual input here as a fallback */}
      </div>
    );
  }

  const currentOption = options[selectedIndex];
  const sliderMax = options.length - 1;

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-medium">Select Target</Label>
        <div className="text-sm text-muted-foreground mt-1">
          Choose a target level suggested by AI for your goal.
        </div>
      </div>

      {/* Slider controls the selectedIndex */}
      <div className="space-y-3 pt-2">
        <Slider
          value={[selectedIndex]}
          min={0}
          max={sliderMax}
          step={1}
          onValueChange={handleSliderChange}
          className="mt-2"
          aria-label="Select AI suggested target"
          disabled={disabled || sliderMax < 1} // Disable if only one option or explicitly disabled
        />
        {/* Display labels for context if more than one option */}
        {sliderMax > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>{options[0]?.label}</span>
            <span>{options[sliderMax]?.label}</span>
          </div>
        )}
      </div>

      {/* Display details of the currently selected option with better layout */}
      {currentOption && (
        <div className="mt-4 p-3 border rounded-md bg-muted/50 min-h-[60px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-primary">{currentOption.label}</span>
            {/* Display the actual numeric target value */}
            <span className="text-xs font-mono bg-background border px-2 py-0.5 rounded">
              Target Value: {currentOption.value}
            </span>
          </div>
          {currentOption.description && (
            <p className="text-xs text-muted-foreground">{currentOption.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
