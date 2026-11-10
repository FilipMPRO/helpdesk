import { Logo } from "@/components/logo"
import { RoleTag } from "@/components/role-tag"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions"

// Naglowek paneli (w jasnym trybie pomaranczowy a w ciemnym czarny)
export function Navbar({ user }) {
  return (
    <header className="border-b border-transparent bg-primary text-primary-foreground dark:border-border dark:bg-background dark:text-foreground">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Logo squareClassName="bg-primary-foreground dark:bg-primary" />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium sm:inline">{user.email}</span>
          <RoleTag role={user.role} compact />
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="border-transparent dark:border-input">
              Wyloguj
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
