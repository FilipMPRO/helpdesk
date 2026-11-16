import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// latin-ext dla polskich znakow
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata = {
  title: {
    template: "%s | Szkolny Helpdesk",
    default: "Szkolny Helpdesk",
  },
  description: "System zgłaszania usterek w szkole",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning bo next-themes dopisuje klase dark przed zaladowaniem Reacta
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {/* Kreska w kolorze akcentu (w ciemnym trybie czerwona nad czarnym naglowkiem) */}
          <div className="h-1 shrink-0 bg-primary" />
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
