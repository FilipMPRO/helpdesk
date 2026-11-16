"use server"
// Akcje zgloszen wykonywane na serwerze (dostep pilnuja tez reguly API w PocketBase)

import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthedPb, getUser, requireRole } from "./pocketbase"
import { photoError, statusChangeSchema, ticketSchema } from "./schemas"

// Odczytuje i sprawdza pola formularza zgloszenia
function readTicketForm(formData) {
  const check = ticketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    room: formData.get("room"),
    category: formData.get("category"),
    priority: formData.get("priority"),
  })
  if (!check.success) {
    return { error: "Popraw błędy w formularzu." }
  }

  const photo = formData.get("photo")
  const error = photoError(photo)
  if (error) {
    return { error }
  }

  // Zdjecie dolaczane tylko gdy uzytkownik je wybral
  const hasPhoto = photo instanceof File && photo.size > 0
  return { data: hasPhoto ? { ...check.data, photo } : check.data }
}

export async function createTicket(formData) {
  const user = await requireRole("user")
  const { data, error } = readTicketForm(formData)
  if (error) {
    return { error }
  }

  const pb = await getAuthedPb()
  try {
    // Autor i status ustawiane na serwerze (regula Create i tak to sprawdza)
    await pb.collection("tickets").create({ ...data, author: user.id, status: "new" })
  } catch {
    return { error: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie." }
  }

  refresh()
}

export async function updateTicket(ticketId, formData) {
  await requireRole("user")
  const { data, error } = readTicketForm(formData)
  if (error) {
    return { error }
  }

  const pb = await getAuthedPb()
  try {
    await pb.collection("tickets").update(ticketId, data)
  } catch {
    // Regula Update pozwala autorowi edytowac tylko zgloszenie ze statusem Nowe
    return { error: "Tego zgłoszenia nie można już edytować." }
  }

  refresh()
}

// Usuwa zgloszenie (autor gdy status Nowe albo technik)
export async function deleteTicket(ticketId) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const pb = await getAuthedPb()
  try {
    await pb.collection("tickets").delete(ticketId)
  } catch {
    return { error: "Nie udało się usunąć zgłoszenia." }
  }

  refresh()
}

// Zmienia status zgloszenia i zapisuje zmiane w historii ticket_events (tylko technik)
export async function changeTicketStatus(ticketId, data) {
  const user = await requireRole("technician")
  const check = statusChangeSchema.safeParse(data)
  if (!check.success) {
    return { error: check.error.issues[0].message }
  }
  const { status, comment } = check.data

  const pb = await getAuthedPb()
  try {
    const ticket = await pb.collection("tickets").getOne(ticketId)
    if (ticket.status === status && !comment) {
      return { error: "Zmień status albo dopisz komentarz." }
    }

    // Pusty komentarz zostawia poprzedni na zgloszeniu
    await pb.collection("tickets").update(ticketId, comment ? { status, comment } : { status })
    await pb.collection("ticket_events").create({
      ticket: ticketId,
      changed_by: user.id,
      from_status: ticket.status,
      to_status: status,
      comment,
    })
  } catch {
    return { error: "Nie udało się zapisać zmiany." }
  }

  refresh()
}
