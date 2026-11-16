"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { PriorityLabel } from "@/components/priority-label"
import { StatusBadge } from "@/components/status-badge"
import { TicketHistory } from "@/components/ticket-history"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteTicket } from "@/lib/ticket-actions"
import { categoryNames, priorityNames, statusNames, ticketCountLabel } from "@/lib/tickets"
import { StatusForm } from "./status-form"

// Lista wyboru filtra (wartosc "all" = bez filtrowania)
function FilterSelect({ label, value, onChange, items }) {
  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full sm:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([itemValue, itemLabel]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {itemLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Odbiera zmiany z PocketBase przez /api/tickets/live i odswieza strone
function useLiveTickets() {
  const router = useRouter()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const source = new EventSource("/api/tickets/live")
    source.onmessage = (event) => {
      if (event.data === "ready") {
        setConnected(true)
        return
      }
      if (event.data === "create") {
        toast.info("Wpłynęło nowe zgłoszenie.")
      }
      router.refresh()
    }
    // EventSource sam probuje polaczyc sie ponownie
    source.onerror = () => setConnected(false)
    return () => source.close()
  }, [router])

  return connected
}

export function TicketsTable({ tickets, rooms }) {
  const connected = useLiveTickets()
  const [status, setStatus] = useState("all")
  const [room, setRoom] = useState("all")
  const [priority, setPriority] = useState("all")
  const [selectedId, setSelectedId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, startDeleting] = useTransition()

  // Zgloszenia, ktore pojawily sie po wejsciu na strone, sa przez chwile podswietlone
  const seenIds = useRef(new Set(tickets.map((ticket) => ticket.id)))
  const [newIds, setNewIds] = useState([])
  useEffect(() => {
    const fresh = tickets.filter((ticket) => !seenIds.current.has(ticket.id)).map((ticket) => ticket.id)
    if (fresh.length === 0) {
      return
    }
    fresh.forEach((id) => seenIds.current.add(id))
    setNewIds((ids) => [...ids, ...fresh])
    const timer = setTimeout(() => setNewIds((ids) => ids.filter((id) => !fresh.includes(id))), 6000)
    return () => clearTimeout(timer)
  }, [tickets])

  const visibleTickets = tickets.filter(
    (ticket) =>
      (status === "all" || ticket.status === status) &&
      (room === "all" || ticket.roomId === room) &&
      (priority === "all" || ticket.priority === priority)
  )
  const filtersActive = status !== "all" || room !== "all" || priority !== "all"
  const selected = tickets.find((ticket) => ticket.id === selectedId)

  function clearFilters() {
    setStatus("all")
    setRoom("all")
    setPriority("all")
  }

  function removeTicket() {
    startDeleting(async () => {
      const result = await deleteTicket(selected.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Zgłoszenie zostało usunięte.")
      setConfirmDelete(false)
      setSelectedId(null)
    })
  }

  return (
    <>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <FilterSelect
          label="Filtr statusu"
          value={status}
          onChange={setStatus}
          items={{ all: "Wszystkie statusy", ...statusNames }}
        />
        <FilterSelect
          label="Filtr sali"
          value={room}
          onChange={setRoom}
          items={{ all: "Wszystkie sale", ...Object.fromEntries(rooms.map((item) => [item.id, item.name])) }}
        />
        <FilterSelect
          label="Filtr priorytetu"
          value={priority}
          onChange={setPriority}
          items={{ all: "Wszystkie priorytety", ...priorityNames }}
        />
        <span className="text-sm text-muted-foreground sm:ml-2">{ticketCountLabel(visibleTickets.length)}</span>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Wyczyść filtry
          </Button>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:ml-auto">
          <span className={cn("size-2 rounded-full", connected ? "bg-emerald-500" : "bg-muted-foreground/40")} />
          {connected ? "Na żywo" : "Łączenie…"}
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-4">Zgłoszenie</TableHead>
              <TableHead className="hidden px-4 sm:table-cell">Sala</TableHead>
              <TableHead className="hidden px-4 sm:table-cell">Priorytet</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="hidden px-4 md:table-cell">Zgłaszający</TableHead>
              <TableHead className="hidden px-4 sm:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                onClick={() => setSelectedId(ticket.id)}
                className={cn("cursor-pointer", newIds.includes(ticket.id) && "bg-primary/10 hover:bg-primary/15")}
              >
                <TableCell className="px-4 whitespace-normal">
                  <button type="button" className="text-left font-medium hover:underline">
                    {ticket.title}
                  </button>
                  <p className="text-xs text-muted-foreground">{categoryNames[ticket.category]}</p>
                  {/* Na telefonie sala i priorytet pod tytulem zamiast w osobnych kolumnach */}
                  <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground sm:hidden">
                    {ticket.roomName} · <PriorityLabel priority={ticket.priority} />
                  </p>
                </TableCell>
                <TableCell className="hidden px-4 sm:table-cell">{ticket.roomName}</TableCell>
                <TableCell className="hidden px-4 sm:table-cell">
                  <PriorityLabel priority={ticket.priority} />
                </TableCell>
                <TableCell className="px-4">
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="hidden px-4 text-muted-foreground md:table-cell">
                  {ticket.authorEmail}
                </TableCell>
                <TableCell className="hidden px-4 text-muted-foreground sm:table-cell">{ticket.created}</TableCell>
              </TableRow>
            ))}

            {visibleTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {filtersActive ? "Brak zgłoszeń dla wybranych filtrów." : "Nie ma jeszcze żadnych zgłoszeń."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="overflow-y-auto data-[side=right]:sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="pr-12">
                <SheetTitle className="text-lg">{selected.title}</SheetTitle>
                <SheetDescription>
                  {selected.roomName} · {categoryNames[selected.category]} · {selected.created}
                  <br />
                  Zgłosił(a): {selected.authorEmail}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-5 px-4 pb-4">
                <div className="flex items-center gap-4 text-sm">
                  <StatusBadge status={selected.status} />
                  <PriorityLabel priority={selected.priority} />
                </div>

                <p className="text-sm whitespace-pre-wrap">{selected.description}</p>

                {selected.photoUrl && (
                  <a href={selected.photoUrl} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.photoUrl}
                      alt={`Zdjęcie: ${selected.title}`}
                      className="max-h-72 w-full rounded-lg border object-cover"
                    />
                  </a>
                )}

                {/* key odswieza formularz po zapisaniu zmiany */}
                <StatusForm key={`${selected.id}-${selected.events.length}`} ticket={selected} />

                <TicketHistory ticket={selected} />

                <Button variant="destructive" className="w-fit" onClick={() => setConfirmDelete(true)}>
                  <Trash2Icon data-icon="inline-start" />
                  Usuń zgłoszenie
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={(open) => !isDeleting && setConfirmDelete(open)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Usunąć zgłoszenie?</DialogTitle>
            <DialogDescription>Zgłoszenie razem z historią zmian zniknie na stałe.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={isDeleting} onClick={() => setConfirmDelete(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={removeTicket}>
              {isDeleting && <Loader2Icon className="animate-spin" />}
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
