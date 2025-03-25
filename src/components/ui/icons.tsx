import { Plus, Trash } from 'lucide-react';

export const Icons = {
  plus: Plus,
  trash: Trash,
  // Add more icons as needed
} as const;

export type IconName = keyof typeof Icons;
