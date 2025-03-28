'use client';

import { usePathname, useParams } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Your Dashboard',
  '/goals': 'Your Goals',
  '/goals/[id]': 'Goal Details',
};

export function PageTitle() {
  const pathname = usePathname();
  const params = useParams();

  // Convert dynamic path segments to Next.js route pattern
  const routePattern = pathname
    .split('/')
    .map(segment => {
      // Check if this segment is a dynamic parameter
      const paramKey = Object.keys(params).find(key => params[key] === segment);
      return paramKey ? `[${paramKey}]` : segment;
    })
    .join('/');

  const titleConfig = pageTitles[routePattern];
  const title = titleConfig || 'MisMetas';

  return <h1 className="text-3xl">{title}</h1>;
}
