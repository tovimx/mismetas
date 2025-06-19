'use client';

import { useTheme, THEME_COLORS, ThemeColor } from '@/contexts/theme-context';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';

export function ThemePicker() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10"
          aria-label="Theme color picker"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.entries(THEME_COLORS) as [ThemeColor, typeof THEME_COLORS[ThemeColor]][]).map(
          ([key, theme]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-black"
                  style={{ backgroundColor: theme.value }}
                />
                <span className="text-sm">{theme.name}</span>
              </div>
              {currentTheme === key && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}