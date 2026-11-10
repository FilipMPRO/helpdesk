import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { formatDate } from "@/lib/dates"
import { getAuthedPb, requireRole } from "@/lib/pocketbase"
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

  // Przekazuje do przegladarki tylko potrzebne pola
  const tickets = ticketRecords.map((ticket) => {
    // updated w adresie zdjecia odswieza je w przegladarce po edycji
    const photoUrl = `/api/tickets/${ticket.id}/photo?v=${encodeURIComponent(ticket.updated)}`
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      roomId: ticket.room,
      roomName: ticket.expand?.room?.name ?? "",
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      comment: ticket.comment,
      created: formatDate(ticket.created),
      photoUrl: ticket.photo ? photoUrl : null,
      thumbUrl: ticket.photo ? `${photoUrl}&thumb` : null,
    }
  })

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
