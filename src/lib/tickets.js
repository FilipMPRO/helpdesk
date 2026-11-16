// Nazwy wartosci z kolekcji tickets (klucze jak w bazie)
export const categoryNames = {
  hardware: "Sprzęt komputerowy",
  multimedia: "Multimedia",
  installations: "Instalacje",
  other: "Inne",
}

export const priorityNames = {
  low: "Niski",
  medium: "Średni",
  high: "Wysoki",
}

export const statusNames = {
  new: "Nowe",
  in_progress: "W realizacji",
  closed: "Zamknięte",
}

// Odmiana slowa zgloszenie (1 zgloszenie, 2 zgloszenia, 5 zgloszen)
export function ticketCountLabel(count) {
  const lastDigit = count % 10
  const lastTwo = count % 100
  if (count === 1) {
    return "1 zgłoszenie"
  }
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} zgłoszenia`
  }
  return `${count} zgłoszeń`
}
