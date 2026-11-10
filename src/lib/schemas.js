import { z } from "zod"

// Walidacja formularzy (w przegladarce i drugi raz na serwerze)

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

export const ticketSchema = z.object({
  title: z.string().trim().min(3, "Tytuł musi mieć co najmniej 3 znaki.").max(100, "Tytuł może mieć maksymalnie 100 znaków."),
  description: z
    .string()
    .trim()
    .min(10, "Opisz problem w co najmniej 10 znakach.")
    .max(2000, "Opis może mieć maksymalnie 2000 znaków."),
  room: z.string("Wybierz salę.").min(1, "Wybierz salę."),
  category: z.enum(["hardware", "multimedia", "installations", "other"], "Wybierz kategorię."),
  priority: z.enum(["low", "medium", "high"], "Wybierz priorytet."),
})

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]
const PHOTO_MAX_SIZE = 5 * 1024 * 1024

// Sprawdza zdjecie (typ i rozmiar jak w ustawieniach pola photo w PocketBase)
export function photoError(file) {
  if (!file || file.size === 0) {
    return null
  }
  if (!PHOTO_TYPES.includes(file.type)) {
    return "Zdjęcie musi być w formacie JPG, PNG lub WEBP."
  }
  if (file.size > PHOTO_MAX_SIZE) {
    return "Zdjęcie może mieć maksymalnie 5 MB."
  }
  return null
}
