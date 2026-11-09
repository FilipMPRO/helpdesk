import PocketBase from "pocketbase"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const AUTH_COOKIE = "pb_auth"

// Nowa instancja na kazde zadanie - authStore trzyma token,
// wiec wspoldzielony klient mieszalby sesje roznych uzytkownikow.
export function createPb() {
  return new PocketBase(process.env.POCKETBASE_URL)
}

// Rekord zalogowanego uzytkownika albo null.
// authRefresh() weryfikuje token w PocketBase i zwraca aktualny rekord,
// wiec rola pochodzi z bazy, nie z ciasteczka.
export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  if (!token) {
    return null
  }

  const pb = createPb()
  pb.authStore.save(token)

  try {
    const result = await pb.collection("users").authRefresh()
    return result.record
  } catch {
    return null
  }
}

// Brak sesji -> /login, inna rola -> panel wlasnej roli.
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
