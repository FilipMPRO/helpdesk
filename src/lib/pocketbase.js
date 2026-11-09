import PocketBase from "pocketbase"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const AUTH_COOKIE = "pb_auth"

// Tworzy nowe polaczenie z PocketBase (osobne dla kazdego zapytania)
export function createPb() {
  return new PocketBase(process.env.POCKETBASE_URL)
}

// Laczy z PocketBase jako zalogowany uzytkownik (token z ciasteczka)
export async function getAuthedPb() {
  const cookieStore = await cookies()
  const pb = createPb()
  pb.authStore.save(cookieStore.get(AUTH_COOKIE)?.value ?? "")
  return pb
}

// Sprawdza w PocketBase kto jest zalogowany i zwraca jego konto albo null
export async function getUser() {
  const pb = await getAuthedPb()
  if (!pb.authStore.token) {
    return null
  }

  try {
    const result = await pb.collection("users").authRefresh()
    return result.record
  } catch {
    return null
  }
}

// Wpuszcza tylko podana role a reszte przekierowuje
export async function requireRole(role) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  if (user.role !== role) {
    redirect("/" + user.role)
  }
  return user
}
