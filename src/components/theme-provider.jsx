"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// Przelacza klase "dark" na <html> i zapamietuje wybor (start wg ustawien systemu)
export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
