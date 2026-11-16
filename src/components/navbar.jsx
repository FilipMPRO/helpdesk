import { Logo } from "@/components/logo"
import { RoleTag } from "@/components/role-tag"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions"

// Naglowek paneli w kolorze akcentu (jasny pomaranczowy, ciemny czerwony)
export function Navbar({ user }) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Logo squareClassName="bg-primary-foreground" />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium sm:inline">{user.email}</span>
          <RoleTag role={user.role} compact />
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="border-transparent dark:border-transparent dark:bg-background dark:hover:bg-muted">
              Wyloguj
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
