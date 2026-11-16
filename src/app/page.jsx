import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/pocketbase"

// Przekierowuje do panelu roli albo na /login
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
