"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { FormAlert } from "@/components/form-alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { changeTicketStatus } from "@/lib/ticket-actions"
import { statusChangeSchema } from "@/lib/schemas"
import { statusNames } from "@/lib/tickets"

// Formularz zmiany statusu z komentarzem
export function StatusForm({ ticket }) {
  const [serverError, setServerError] = useState("")
  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(statusChangeSchema),
    defaultValues: { status: ticket.status, comment: "" },
  })
  const { errors, isSubmitting } = formState

  async function onSubmit(data) {
    setServerError("")
    const result = await changeTicketStatus(ticket.id, data)
    if (result?.error) {
      setServerError(result.error)
      return
    }
    toast.success("Zmiana została zapisana.")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-xl border p-4">
      <FieldGroup className="gap-4">
        <p className="text-sm font-medium">Zmień status</p>
        <FormAlert message={serverError} />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="status-select" className="sr-only">
                Status
              </FieldLabel>
              <Select items={statusNames} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusNames).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="status-comment" className="sr-only">
            Komentarz
          </FieldLabel>
          <Textarea
            id="status-comment"
            rows={2}
            placeholder="Komentarz dla zgłaszającego (opcjonalnie)"
            aria-invalid={!!errors.comment}
            {...register("comment")}
          />
          <FieldError>{errors.comment?.message}</FieldError>
        </Field>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Zapisz
        </Button>
      </FieldGroup>
    </form>
  )
}
