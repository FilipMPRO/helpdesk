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
import { login } from "@/lib/actions"
import { loginSchema } from "@/lib/schemas"

export default function LoginPage() {
  const [serverError, setServerError] = useState("")
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(loginSchema),
  })
  const { errors, isSubmitting } = formState

  async function onSubmit(data) {
    setServerError("")
    // Sukces konczy sie redirectem w akcji - wynik wraca tylko przy bledzie.
    const result = await login(data)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <AuthLayout
      title="Zaloguj się"
      description="Zgłoś usterkę albo sprawdź status swoich zgłoszeń."
      footer={
        <>
          Nie masz konta?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Zarejestruj się
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
            <PasswordInput id="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {isSubmitting ? "Logowanie…" : "Zaloguj się"}
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
