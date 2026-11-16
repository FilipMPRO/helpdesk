import { statusNames } from "@/lib/tickets"

// Os zmian zgloszenia: od najnowszej zmiany do utworzenia
export function TicketHistory({ ticket }) {
  const events = [...ticket.events].reverse()

  return (
    <div>
      <p className="text-sm font-medium">Historia</p>
      <ol className="mt-3 flex flex-col gap-3 border-l pl-4 text-sm">
        {events.map((event) => (
          <li key={event.id}>
            <p className="font-medium">
              {event.fromStatus === event.toStatus
                ? `Komentarz (${statusNames[event.toStatus]})`
                : `${statusNames[event.fromStatus]} → ${statusNames[event.toStatus]}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {event.by} · {event.created}
            </p>
            {event.comment && <p className="mt-1 whitespace-pre-wrap">{event.comment}</p>}
          </li>
        ))}
        <li>
          <p className="font-medium">Zgłoszenie utworzone</p>
          <p className="text-xs text-muted-foreground">
            {ticket.authorEmail ? `${ticket.authorEmail} · ` : ""}
            {ticket.createdAt}
          </p>
        </li>
      </ol>
    </div>
  )
}
