'use client'

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOutAction } from "@/app/actions/auth-actions"

interface SignOutFormProps {
  redirectTo?: string;
  showIcon?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function SignOutForm({
  redirectTo = "/login",
  showIcon = true,
  className,
  variant = "outline"
}: SignOutFormProps) {
  return (
    <form action={() => signOutAction(redirectTo)}>
      <Button
        type="submit"
        variant={variant}
        className={className}
      >
        {showIcon && <LogOut className="h-4 w-4 mr-2" />}
        Sign out
      </Button>
    </form>
  )
} 