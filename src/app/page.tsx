import { redirect } from 'next/navigation';

// This ensures the redirect happens on both server and client
export default function Home() {
  // Using a direct redirect
  redirect('/login');
  
  // This code will never execute
  return null;
}
