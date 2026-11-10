import { Logo } from "@/components/logo"
import { RoleTag } from "@/components/role-tag"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions"

export function Navbar({ user }) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Logo squareClassName="bg-primary-foreground" />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium sm:inline">{user.email}</span>
          <RoleTag role={user.role} compact />
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="border-transparent">
              Wyloguj
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
