import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { getAuthedPb, requireRole } from "@/lib/pocketbase"
import { getEventsByTicket, toTicket } from "@/lib/ticket-data"
import { TicketStats } from "./ticket-stats"
import { TicketsTable } from "./tickets-table"

// Suspense wymagany przez cacheComponents
export default function TechnicianPage() {
  return (
    <Suspense fallback={<p className="p-4 text-muted-foreground">Ładowanie…</p>}>
      <TechnicianPanel />
    </Suspense>
  )
}

// Liczy dane do dashboardu z listy zgloszen
function getStats(tickets) {
  const byStatus = { new: 0, in_progress: 0, closed: 0 }
  const byCategory = { hardware: 0, multimedia: 0, installations: 0, other: 0 }
  const byRoom = {}

  for (const ticket of tickets) {
    byStatus[ticket.status] += 1
    byCategory[ticket.category] += 1
    byRoom[ticket.roomName] = (byRoom[ticket.roomName] ?? 0) + 1
  }

  // Sala z najwieksza liczba zgloszen
  const [topRoomName, topRoomCount] = Object.entries(byRoom).sort((a, b) => b[1] - a[1])[0] ?? ["—", 0]

  return { byStatus, byCategory, topRoomName, topRoomCount }
}

async function TechnicianPanel() {
  const user = await requireRole("technician")
  const pb = await getAuthedPb()

  // Pobiera sale do filtra
  const roomRecords = await pb.collection("rooms").getFullList({ sort: "name" })
  const rooms = roomRecords.map((room) => ({ id: room.id, name: room.name }))

  // Pobiera wszystkie zgloszenia razem z sala i zglaszajacym oraz historie zmian
  const ticketRecords = await pb.collection("tickets").getFullList({
    sort: "-created",
    expand: "room,author",
  })
  const events = await getEventsByTicket(pb)
  const tickets = ticketRecords.map((record) => toTicket(record, events[record.id]))

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Zgłoszenia</h1>
        <TicketStats stats={getStats(tickets)} />
        <TicketsTable tickets={tickets} rooms={rooms} />
      </main>
    </>
  )
}
