import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions"

const roleNames = {
  user: "Użytkownik",
  technician: "Technik",
  admin: "Administrator",
}

export function Navbar({ user }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm sm:inline">{user.email}</span>
          <Badge variant="secondary">{roleNames[user.role]}</Badge>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Wyloguj
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
