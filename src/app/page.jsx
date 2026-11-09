import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/pocketbase"

// "/" nie ma wlasnej tresci - przekierowuje do panelu roli albo na /login.
export default function HomePage() {
  return (
    <Suspense>
      <GoToPanel />
    </Suspense>
  )
}

async function GoToPanel() {
  const user = await getUser()
  redirect(user ? "/" + user.role : "/login")
}
