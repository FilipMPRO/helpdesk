"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { FormAlert } from "@/components/form-alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createTicket, updateTicket } from "@/lib/ticket-actions"
import { photoError, ticketSchema } from "@/lib/schemas"
import { categoryNames, priorityNames } from "@/lib/tickets"

// Lista wyboru podpieta pod react-hook-form
function SelectField({ control, name, id, label, placeholder, items }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select items={items} value={field.value ?? null} onValueChange={field.onChange}>
            <SelectTrigger id={id} className="w-full" aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(items).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  )
}

// Formularz zgloszenia (nowe albo edycja gdy przekazany jest ticket)
export function TicketForm({ rooms, ticket, onSaved, onCancel }) {
  const [serverError, setServerError] = useState("")
  const roomItems = Object.fromEntries(rooms.map((room) => [room.id, room.name]))
  // Osobne id pol bo formularz nowego zgloszenia i edycji moga byc na stronie naraz
  const fieldId = (name) => `${ticket ? "edit" : "new"}-${name}`

  const { register, control, handleSubmit, reset, setError, formState } = useForm({
    // raw: true zostawia plik zdjecia w danych formularza
    resolver: zodResolver(ticketSchema, undefined, { raw: true }),
    defaultValues: {
      title: ticket?.title ?? "",
      description: ticket?.description ?? "",
      room: ticket?.roomId ?? null,
      category: ticket?.category ?? null,
      priority: ticket?.priority ?? "medium",
    },
  })
  const { errors, isSubmitting } = formState

  async function onSubmit(data) {
    setServerError("")

    const photo = data.photo?.[0]
    const error = photoError(photo)
    if (error) {
      setError("photo", { message: error })
      return
    }

    // FormData bo razem z polami idzie plik
    const formData = new FormData()
    for (const key of ["title", "description", "room", "category", "priority"]) {
      formData.append(key, data[key])
    }
    if (photo) {
      formData.append("photo", photo)
    }

    const result = ticket ? await updateTicket(ticket.id, formData) : await createTicket(formData)
    if (result?.error) {
      setServerError(result.error)
      return
    }

    toast.success(ticket ? "Zgłoszenie zostało zapisane." : "Zgłoszenie zostało wysłane.")
    reset()
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FormAlert message={serverError} />

        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor={fieldId("title")}>Tytuł</FieldLabel>
          <Input id={fieldId("title")} placeholder="np. Nie działa rzutnik" aria-invalid={!!errors.title} {...register("title")} />
          <FieldError>{errors.title?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor={fieldId("description")}>Opis</FieldLabel>
          <Textarea
            id={fieldId("description")}
            rows={4}
            placeholder="Co się dzieje i od kiedy?"
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </Field>

        <SelectField control={control} name="room" id={fieldId("room")} label="Sala" placeholder="Wybierz salę" items={roomItems} />
        <SelectField
          control={control}
          name="category"
          id={fieldId("category")}
          label="Kategoria"
          placeholder="Wybierz kategorię"
          items={categoryNames}
        />
        <SelectField control={control} name="priority" id={fieldId("priority")} label="Priorytet" items={priorityNames} />

        <Field data-invalid={!!errors.photo}>
          <FieldLabel htmlFor={fieldId("photo")}>Zdjęcie (opcjonalnie)</FieldLabel>
          <Input
            id={fieldId("photo")}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-invalid={!!errors.photo}
            {...register("photo")}
          />
          {errors.photo ? (
            <FieldError>{errors.photo.message}</FieldError>
          ) : (
            <FieldDescription>
              {ticket?.photoUrl ? "Wybierz plik tylko jeśli chcesz zmienić zdjęcie. " : ""}
              JPG, PNG lub WEBP do 5 MB.
            </FieldDescription>
          )}
        </Field>

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="lg" disabled={isSubmitting} onClick={onCancel}>
              Anuluj
            </Button>
          )}
          <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {ticket ? "Zapisz zmiany" : "Wyślij zgłoszenie"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
