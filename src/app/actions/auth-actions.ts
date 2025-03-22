'use server';

import { signOut as authSignOut } from '@/auth';

export async function signOutAction(redirectTo: string = '/login') {
  return authSignOut({ redirectTo });
}
