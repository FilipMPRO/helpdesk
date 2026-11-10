import { cn } from "cn"
import { roleIcons, roleNames } from "@/lib/roles"

// Znacznik roli w rozmiarze listy wyboru
// compact ukrywa nazwe roli na waskim ekranie (zostaje sama ikona)
export function RoleTag({ role, compact = false, className }) {
  const Icon = roleIcons[role]

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-[min(var(--radius-md),10px)] border border-foreground bg-foreground px-2.5 text-sm whitespace-nowrap text-background [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
    >
      <Icon aria-hidden="true" />
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{roleNames[role]}</span>
    </span>
  )
}
