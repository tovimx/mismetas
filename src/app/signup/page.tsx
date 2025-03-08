import { SignUpForm } from "@/components/auth/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | MisMetas",
  description: "Create an account to track your goals and progress"
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join MisMetas to start tracking your goals
          </p>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
} 