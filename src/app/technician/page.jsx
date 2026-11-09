import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { requireRole } from "@/lib/pocketbase"

// Odczyt sesji (cookies) musi byc w <Suspense> - wymog cacheComponents.
export default function TechnicianPage() {
  return (
    <Suspense fallback={<p className="p-4 text-muted-foreground">Ładowanie…</p>}>
      <TechnicianPanel />
    </Suspense>
  )
}

async function TechnicianPanel() {
  const user = await requireRole("technician")

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Panel technika</h1>
        <p className="mt-2 text-muted-foreground">
          Tutaj pojawi się tabela wszystkich zgłoszeń z filtrami i dashboard.
        </p>
      </main>
    </>
  )
}
