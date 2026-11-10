// Zamienia date z PocketBase na polski format (spacja w dacie zamieniona na T)
export function formatDate(value) {
  return new Date(value.replace(" ", "T")).toLocaleDateString("pl-PL", {
    timeZone: "Europe/Warsaw",
  })
}
