'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { SignOutForm } from '@/components/auth/sign-out-form';
import { Button } from '@/components/ui/button';
import { User as UserIcon } from 'lucide-react'; // Using UserIcon as a fallback

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-10 h-10 flex items-center justify-center relative overflow-hidden" // Added relative and overflow-hidden for Image with fill
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User menu'}
            fill
            sizes="40px" // Corresponds to w-10 h-10 (2.5rem = 40px)
            className="object-cover" // Removed rounded-full here as parent button is round and handles overflow
            priority // Consider if this is LCP for authenticated users
          />
        ) : (
          <UserIcon className="h-5 w-5 text-muted-foreground" /> // Fallback icon
        )}
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-card shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="py-1">
            {user.email && (
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs text-muted-foreground truncate">Signed in as</p>
                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              </div>
            )}
            <div className="p-1 mt-1">
              <SignOutForm
                variant="ghost"
                className="w-full text-left justify-start px-3 py-2 text-sm hover:bg-muted rounded-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
