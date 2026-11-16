import { ArrowUpIcon } from "lucide-react"
import { priorityNames } from "@/lib/tickets"

// Wysoki priorytet na czerwono ze strzalka a reszta szara
export function PriorityLabel({ priority }) {
  if (priority === "high") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 font-medium whitespace-nowrap text-destructive">
        <ArrowUpIcon className="size-3.5" />
        {priorityNames.high}
      </span>
    )
  }
  return <span className="shrink-0 whitespace-nowrap text-muted-foreground">{priorityNames[priority]}</span>
}
