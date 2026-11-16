import { EventSource } from "eventsource"
import { getAuthedPb, getUser } from "@/lib/pocketbase"

// SDK PocketBase uzywa EventSource ktorego nie ma w Node
globalThis.EventSource ??= EventSource

// Przekazuje przegladarce technika zmiany w kolekcji tickets (realtime PocketBase)
// Przegladarka nie ma tokenu wiec to serwer subskrybuje PocketBase w jej imieniu
export async function GET(request) {
  const user = await getUser()
  if (user?.role !== "technician") {
    return new Response(null, { status: 403 })
  }

  const pb = await getAuthedPb()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text) => controller.enqueue(encoder.encode(text))

      // Kazda zmiana zgloszenia wysyla do przegladarki jego akcje (create / update / delete)
      const unsubscribe = await pb.collection("tickets").subscribe("*", (event) => {
        send(`data: ${event.action}\n\n`)
      })
      send("data: ready\n\n")

      // Pusty komunikat co 25 s zeby proxy na serwerze nie zamknelo polaczenia
      const ping = setInterval(() => send(": ping\n\n"), 25000)

      // Sprzata po zamknieciu karty przez technika
      request.signal.addEventListener("abort", () => {
        clearInterval(ping)
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  })
}
