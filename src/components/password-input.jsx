"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Pole hasla z przyciskiem pokaz / ukryj
export function PasswordInput(props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-9" />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        // Bez translate bo Button uzywa go przy kliknieciu
        className="absolute top-1 right-1 text-muted-foreground"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}
