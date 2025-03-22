import { Plus } from 'lucide-react';

export const Icons = {
  plus: Plus,
  // Add more icons as needed
} as const;

export type IconName = keyof typeof Icons;
