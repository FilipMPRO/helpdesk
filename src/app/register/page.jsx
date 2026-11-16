"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { FormAlert } from "@/components/form-alert"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { register as registerUser } from "@/lib/actions"
import { registerSchema } from "@/lib/schemas"

export default function RegisterPage() {
  const [serverError, setServerError] = useState("")
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(registerSchema),
  })
  const { errors, isSubmitting } = formState

  async function onSubmit(data) {
    setServerError("")
    // Przy sukcesie akcja sama przekierowuje
    const result = await registerUser(data)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <AuthLayout
      title="Załóż konto"
      description="Zarejestruj się, aby zgłaszać usterki i śledzić postęp ich naprawy."
      footer={
        <>
          Masz już konto?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Zaloguj się
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <FormAlert message={serverError} />

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Hasło</FieldLabel>
            <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.passwordConfirm}>
            <FieldLabel htmlFor="passwordConfirm">Powtórz hasło</FieldLabel>
            <PasswordInput id="passwordConfirm" autoComplete="new-password" aria-invalid={!!errors.passwordConfirm} {...register("passwordConfirm")} />
            <FieldError>{errors.passwordConfirm?.message}</FieldError>
          </Field>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {isSubmitting ? "Tworzenie konta…" : "Załóż konto"}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
