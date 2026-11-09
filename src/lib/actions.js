"use server"
// Server actions: wykonywane wylacznie na serwerze, wywolywane z formularzy jak zwykle funkcje.

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_COOKIE, createPb } from "./pocketbase"
import { loginSchema, registerSchema } from "./schemas"

// httpOnly - token niedostepny dla JS w przegladarce (ochrona przed XSS).
// maxAge zgodny z domyslna waznoscia tokenu PocketBase (7 dni).
async function saveToken(token) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function login(data) {
  // Walidacja powtorzona po stronie serwera - dane z przegladarki sa niezaufane.
  const check = loginSchema.safeParse(data)
  if (!check.success) {
    return { error: "Popraw błędy w formularzu." }
  }

  const pb = createPb()
  try {
    await pb.collection("users").authWithPassword(check.data.email, check.data.password)
  } catch (error) {
    // Jeden komunikat dla zlego emaila i hasla - nie ujawniamy, ktore konta istnieja.
    if (error.status === 400) {
      return { error: "Nieprawidłowy email lub hasło." }
    }
    return { error: "Błąd serwera. Spróbuj ponownie później." }
  }

  await saveToken(pb.authStore.token)
  // redirect() rzuca wyjatek, wiec nie moze byc w try/catch.
  redirect("/" + pb.authStore.record.role)
}

export async function register(data) {
  const check = registerSchema.safeParse(data)
  if (!check.success) {
    return { error: "Popraw błędy w formularzu." }
  }

  const pb = createPb()
  try {
    // Rola nadawana na serwerze. Regula Create w PocketBase odrzuca kazda inna niz "user".
    await pb.collection("users").create({ ...check.data, role: "user" })
    await pb.collection("users").authWithPassword(check.data.email, check.data.password)
  } catch (error) {
    if (error.response?.data?.email) {
      return { error: "Konto z tym adresem email już istnieje." }
    }
    return { error: "Nie udało się założyć konta. Spróbuj ponownie." }
  }

  await saveToken(pb.authStore.token)
  redirect("/user")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
  redirect("/login")
}
