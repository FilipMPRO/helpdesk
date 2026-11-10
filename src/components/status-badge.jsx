import { Badge } from "@/components/ui/badge"
import { statusNames } from "@/lib/tickets"

// Kolory statusow: Nowe z obwodka, W realizacji pomaranczowe, Zamkniete szare
const variants = {
  new: "outline",
  in_progress: "default",
  closed: "secondary",
}

export function StatusBadge({ status }) {
  return <Badge variant={variants[status]}>{statusNames[status]}</Badge>
}
