import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { formatDate } from "@/lib/dates"
import { getAuthedPb, requireRole } from "@/lib/pocketbase"
import { UsersTable } from "./users-table"

// Suspense wymagany przez cacheComponents
export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-4 text-muted-foreground">Ładowanie…</p>}>
      <AdminPanel />
    </Suspense>
  )
}

async function AdminPanel() {
  const user = await requireRole("admin")

  const pb = await getAuthedPb()
  const records = await pb.collection("users").getFullList({ sort: "-created" })
  // Przekazuje do tabeli tylko potrzebne pola
  const users = records.map((record) => ({
    id: record.id,
    email: record.email ?? "",
    role: record.role,
    created: formatDate(record.created),
  }))

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Zarządzanie użytkownikami</h1>
        <UsersTable users={users} currentUserId={user.id} />
      </main>
    </>
  )
}
