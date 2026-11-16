"use client"

import { useState, useTransition } from "react"
import { ImageIcon, Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { deleteTicket } from "@/lib/ticket-actions"
import { categoryNames } from "@/lib/tickets"
import { TicketForm } from "./ticket-form"

export function TicketList({ tickets, rooms }) {
  const [selectedId, setSelectedId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, startDeleting] = useTransition()

  // Szuka wybranego zgloszenia w aktualnej liscie (po odswiezeniu dane sa nowe)
  const selected = tickets.find((ticket) => ticket.id === selectedId)
  const canChange = selected?.status === "new"

  function openTicket(id) {
    setSelectedId(id)
    setEditing(false)
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

  if (tickets.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nie masz jeszcze żadnych zgłoszeń.
      </p>
    )
  }

  return (
    <>
      <ul className="mt-4 divide-y rounded-xl border">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <button
              type="button"
              onClick={() => openTicket(ticket.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <TicketThumb url={ticket.thumbUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ticket.title}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate">
                    {ticket.roomName} · {ticket.created} ·
                  </span>
                  <PriorityLabel priority={ticket.priority} />
                </div>
              </div>
              <StatusBadge status={ticket.status} />
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="overflow-y-auto data-[side=right]:sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="pr-12">
                <SheetTitle className="text-lg">{selected.title}</SheetTitle>
                <SheetDescription>
                  {selected.roomName} · {categoryNames[selected.category]} · {selected.created}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-5 px-4 pb-4">
                {editing ? (
                  <TicketForm
                    key={selected.id}
                    rooms={rooms}
                    ticket={selected}
                    onSaved={() => setEditing(false)}
                    onCancel={() => setEditing(false)}
                  />
                ) : (
                  <>
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

                    {selected.comment && (
                      <div className="rounded-lg border p-3 text-sm">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Komentarz technika</p>
                        <p className="whitespace-pre-wrap">{selected.comment}</p>
                      </div>
                    )}

                    {canChange ? (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditing(true)}>
                          <PencilIcon data-icon="inline-start" />
                          Edytuj
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                          <Trash2Icon data-icon="inline-start" />
                          Usuń
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Technik zajął się już tym zgłoszeniem, więc nie można go zmienić ani usunąć.
                      </p>
                    )}

                    <TicketHistory ticket={selected} />
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={(open) => !isDeleting && setConfirmDelete(open)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Usunąć zgłoszenie?</DialogTitle>
            <DialogDescription>Tej operacji nie da się cofnąć.</DialogDescription>
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

// Miniaturka zdjecia albo ikona gdy zgloszenie nie ma zdjecia
function TicketThumb({ url }) {
  if (!url) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ImageIcon className="size-4" />
      </span>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="size-12 shrink-0 rounded-lg border object-cover" />
}
