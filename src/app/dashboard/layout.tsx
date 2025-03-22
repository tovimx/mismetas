import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | MisMetas',
  description: 'Track and manage your goals',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
