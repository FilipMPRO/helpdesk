import { categoryNames, ticketCountLabel } from "@/lib/tickets"

// Kafelek z jedna liczba
function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

// Dashboard technika: kafelki z liczbami i wykres zgloszen wg kategorii
export function TicketStats({ stats }) {
  const { byStatus, byCategory, topRoomName, topRoomCount } = stats
  const maxCategory = Math.max(...Object.values(byCategory), 1)

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Otwarte zgłoszenia" value={byStatus.new + byStatus.in_progress} hint="Nowe i w realizacji" />
        <StatTile label="Nowe" value={byStatus.new} hint="Czekają na technika" />
        <StatTile label="W realizacji" value={byStatus.in_progress} />
        <StatTile label="Najwięcej zgłoszeń" value={topRoomName} hint={ticketCountLabel(topRoomCount)} />
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm font-medium">Zgłoszenia wg kategorii</p>
        <ul className="mt-3 flex flex-col gap-2">
          {Object.entries(byCategory).map(([category, count]) => (
            <li
              key={category}
              title={`${categoryNames[category]}: ${ticketCountLabel(count)}`}
              className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm"
            >
              <span className="truncate text-muted-foreground">{categoryNames[category]}</span>
              <span className="flex items-center gap-2">
                {/* Dlugosc paska proporcjonalna do najwiekszej kategorii */}
                {count > 0 && (
                  <span
                    className="h-3 rounded-r-[4px] bg-foreground/80"
                    style={{ width: `${(count / maxCategory) * 85}%` }}
                  />
                )}
                <span className="tabular-nums">{count}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
