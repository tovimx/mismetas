import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-6">
      <Header user={session.user} />
      {children}
    </div>
  );
}
