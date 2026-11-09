import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { requireRole } from "@/lib/pocketbase"

// Odczyt sesji (cookies) musi byc w <Suspense> - wymog cacheComponents.
export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-4 text-muted-foreground">Ładowanie…</p>}>
      <AdminPanel />
    </Suspense>
  )
}

async function AdminPanel() {
  const user = await requireRole("admin")

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Panel administratora</h1>
        <p className="mt-2 text-muted-foreground">
          Tutaj pojawi się lista użytkowników z możliwością nadania roli technika.
        </p>
      </main>
    </>
  )
}
