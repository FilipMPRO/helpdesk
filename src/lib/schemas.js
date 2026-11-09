import { z } from "zod"

// Walidacja formularzy logowania i rejestracji

export const loginSchema = z.object({
  email: z.email("Podaj poprawny adres email."),
  password: z.string().min(1, "Podaj hasło."),
})

export const registerSchema = z
  .object({
    email: z.email("Podaj poprawny adres email."),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków."),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła nie są takie same.",
    path: ["passwordConfirm"],
  })
