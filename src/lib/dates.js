// Zamienia date z PocketBase na polski format (spacja w dacie zamieniona na T)
export function formatDate(value) {
  return new Date(value.replace(" ", "T")).toLocaleDateString("pl-PL", {
    timeZone: "Europe/Warsaw",
  })
}

// Data z godzina do historii zmian
export function formatDateTime(value) {
  return new Date(value.replace(" ", "T")).toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    dateStyle: "short",
    timeStyle: "short",
  })
}
