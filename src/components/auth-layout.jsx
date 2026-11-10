import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

// Wyglad strony logowania i rejestracji
export function AuthLayout({ title, description, footer, children }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-transparent bg-primary px-4 text-primary-foreground sm:px-10 dark:border-border dark:bg-background dark:text-foreground">
        <Logo squareClassName="bg-primary-foreground dark:bg-primary" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {/* Ramki pol w karcie w kolorze akcentu */}
        <div className="w-full max-w-sm animate-in rounded-xl border border-primary bg-card p-6 duration-500 [--input:color-mix(in_oklch,var(--primary)_50%,transparent)] fade-in slide-in-from-bottom-2 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>
    </div>
  )
}
