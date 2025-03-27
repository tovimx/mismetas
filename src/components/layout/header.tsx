import Image from 'next/image';
import { SignOutForm } from '@/components/auth/sign-out-form';
import { PageTitle } from './page-title';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        {user.image && (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0 relative">
            <Image
              src={user.image}
              alt={`${user.name || 'User'}'s profile`}
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </div>
        )}
        <div>
          <PageTitle />
          {user.email && (
            <div className="text-sm text-muted-foreground mt-1">Signed in as {user.email}</div>
          )}
        </div>
      </div>

      <SignOutForm variant="ghost" />
    </div>
  );
}
