import { ShieldIcon, UserIcon, WrenchIcon } from "lucide-react"

// Nazwy i ikony rol (klucze jak wartosci pola role w bazie)
export const roleNames = {
  user: "Użytkownik",
  technician: "Technik",
  admin: "Administrator",
}

export const roleIcons = {
  user: UserIcon,
  technician: WrenchIcon,
  admin: ShieldIcon,
}
