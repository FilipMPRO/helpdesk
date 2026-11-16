import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { getAuthedPb, requireRole } from "@/lib/pocketbase"
import { getEventsByTicket, toTicket } from "@/lib/ticket-data"
import { TicketForm } from "./ticket-form"
import { TicketList } from "./ticket-list"

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
  const pb = await getAuthedPb()

  // Pobiera liste sal do formularza
  const roomRecords = await pb.collection("rooms").getFullList({ sort: "name" })
  const rooms = roomRecords.map((room) => ({ id: room.id, name: room.name }))

  // Pobiera zgloszenia zalogowanego uzytkownika razem z nazwa sali
  const ticketRecords = await pb.collection("tickets").getFullList({
    filter: pb.filter("author = {:id}", { id: user.id }),
    sort: "-created",
    expand: "room",
  })

  // Dolacza do kazdego zgloszenia jego historie zmian
  const events = await getEventsByTicket(pb)
  const tickets = ticketRecords.map((record) => toTicket(record, events[record.id]))

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <section className="self-start rounded-xl border p-5">
          <h2 className="text-lg font-medium">Nowe zgłoszenie</h2>
          <div className="mt-4">
            <TicketForm rooms={rooms} />
          </div>
        </section>

        <section>
          <h1 className="text-lg font-medium">Moje zgłoszenia</h1>
          <TicketList tickets={tickets} rooms={rooms} />
        </section>
      </main>
    </>
  )
}
