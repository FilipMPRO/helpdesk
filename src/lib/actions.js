"use server"
// Akcje wykonywane na serwerze

import { refresh } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_COOKIE, createPb, getAuthedPb, requireRole } from "./pocketbase"
import { loginSchema, registerSchema } from "./schemas"

// Zapisuje token w ciasteczku niewidocznym dla JavaScriptu (wazne 7 dni jak token)
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
  // Sprawdza dane drugi raz na serwerze
  const check = loginSchema.safeParse(data)
  if (!check.success) {
    return { error: "Popraw błędy w formularzu." }
  }

  const pb = createPb()
  try {
    await pb.collection("users").authWithPassword(check.data.email, check.data.password)
  } catch (error) {
    // Jeden komunikat zeby nie zdradzac czy konto istnieje
    if (error.status === 400) {
      return { error: "Nieprawidłowy email lub hasło." }
    }
    return { error: "Błąd serwera. Spróbuj ponownie później." }
  }

  await saveToken(pb.authStore.token)
  // redirect musi byc poza try/catch
  redirect("/" + pb.authStore.record.role)
}

export async function register(data) {
  const check = registerSchema.safeParse(data)
  if (!check.success) {
    return { error: "Popraw błędy w formularzu." }
  }

  const pb = createPb()
  try {
    // Zawsze rola user i widoczny email dla admina i technika
    await pb.collection("users").create({ ...check.data, role: "user", emailVisibility: true })
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

// Zmienia role uzytkownik / technik (tylko admin)
export async function changeRole(userId, role) {
  await requireRole("admin")
  if (role !== "user" && role !== "technician") {
    return { error: "Nieprawidłowa rola." }
  }

  const pb = await getAuthedPb()
  try {
    await pb.collection("users").update(userId, { role })
  } catch {
    return { error: "Nie udało się zmienić roli." }
  }

  refresh()
}
