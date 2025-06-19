import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'MisMetas | Cumple tus metas',
  description:
    'A collaborative goal-tracking platform to help you acknowledge small wins and stay motivated.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: 'Monaco, monospace' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
