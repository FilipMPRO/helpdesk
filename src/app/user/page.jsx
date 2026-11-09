import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { requireRole } from "@/lib/pocketbase"

// Suspense wymagany przez cacheComponents
export default function UserPage() {
  return (
    <Suspense fallback={<p className="p-4 text-muted-foreground">Ładowanie…</p>}>
      <UserPanel />
    </Suspense>
  )
}

async function UserPanel() {
  const user = await requireRole("user")

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Moje zgłoszenia</h1>
        <p className="mt-2 text-muted-foreground">
          Tutaj pojawi się lista Twoich zgłoszeń i formularz nowego zgłoszenia.
        </p>
      </main>
    </>
  )
}
