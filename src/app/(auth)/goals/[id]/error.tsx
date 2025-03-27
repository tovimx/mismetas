'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { GalleryVerticalEnd } from 'lucide-react';

export default function GoalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Goal error:', error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">MisMetas</span>
          </a>
          <h1 className="text-xl font-bold">Goal Not Found</h1>
          <div className="text-center text-sm text-muted-foreground">
            {error.message || 'The goal you are looking for does not exist or has been removed.'}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Button onClick={() => reset()} className="w-full">
            Try again
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
