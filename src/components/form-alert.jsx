import { CircleAlertIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Blad zwrocony przez server action. Bez komunikatu nic nie renderuje.
export function FormAlert({ message }) {
  if (!message) {
    return null
  }

  return (
    <Alert variant="destructive" className="animate-in duration-300 fade-in">
      <CircleAlertIcon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
