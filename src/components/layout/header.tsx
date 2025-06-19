import Image from 'next/image';
import { SignOutForm } from '@/components/auth/sign-out-form';
import { PageTitle } from './page-title';
import { UserMenu } from './user-menu';
import { ThemePicker } from '@/components/theme-picker';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header
      className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8 mb-6 border-b-2 border-black"
      data-component="header"
    >
      {/* --- Mobile View --- */}
      {/* Visible below md breakpoint. PageTitle left, UserMenu (with dropdown) right. */}
      <div className="flex flex-1 justify-between items-center md:hidden">
        <div className="flex-1 min-w-0">
          <PageTitle />
        </div>
        <div className="ml-4 flex-shrink-0">
          <UserMenu user={user} />
        </div>
      </div>

      {/* --- Desktop View --- */}
      <div className="hidden md:flex flex-1 justify-between items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {user.image && (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-black flex-shrink-0 relative">
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
          <div className="flex-1 min-w-0">
            <PageTitle />
            {user.email && (
              <div className="text-sm text-muted-foreground mt-1 truncate">
                Signed in as {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Right side: ThemePicker and SignOutForm */}
        <div className="flex-shrink-0 ml-auto flex items-center gap-2">
          <ThemePicker />
          <SignOutForm variant="ghost" />
        </div>
      </div>
    </header>
  );
}
