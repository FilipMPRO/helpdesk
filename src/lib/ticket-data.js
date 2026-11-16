import { formatDate, formatDateTime } from "./dates"

// Pobiera historie zmian (reguly API zwracaja tylko to co zalogowany moze zobaczyc)
// i grupuje ja po zgloszeniu
export async function getEventsByTicket(pb) {
  const records = await pb.collection("ticket_events").getFullList({
    sort: "created",
    expand: "changed_by",
  })

  const byTicket = {}
  for (const event of records) {
    byTicket[event.ticket] ??= []
    byTicket[event.ticket].push({
      id: event.id,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      comment: event.comment,
      // Uzytkownik nie widzi kont technikow wiec zamiast emaila pokazuje "Technik"
      by: event.expand?.changed_by?.email || "Technik",
      created: formatDateTime(event.created),
    })
  }
  return byTicket
}

// Zamienia rekord zgloszenia na dane dla przegladarki (tylko potrzebne pola)
export function toTicket(record, events = []) {
  // updated w adresie zdjecia odswieza je w przegladarce po edycji
  const photoUrl = `/api/tickets/${record.id}/photo?v=${encodeURIComponent(record.updated)}`

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    roomId: record.room,
    roomName: record.expand?.room?.name ?? "",
    category: record.category,
    priority: record.priority,
    status: record.status,
    comment: record.comment,
    authorEmail: record.expand?.author?.email ?? "",
    created: formatDate(record.created),
    createdAt: formatDateTime(record.created),
    photoUrl: record.photo ? photoUrl : null,
    thumbUrl: record.photo ? `${photoUrl}&thumb` : null,
    events,
  }
}
