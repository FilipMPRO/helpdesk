import { getAuthedPb } from "@/lib/pocketbase"

// Pobiera zdjecie zgloszenia z PocketBase i oddaje je przegladarce
// Zdjecia sa chronione (Protected) wiec przegladarka nie moze pobrac ich bezposrednio
export async function GET(request, { params }) {
  const { id } = await params
  const pb = await getAuthedPb()

  try {
    // getOne przechodzi przez regule View (cudze zgloszenie konczy sie bledem 404)
    const ticket = await pb.collection("tickets").getOne(id)
    if (!ticket.photo) {
      return new Response(null, { status: 404 })
    }

    // Token do chronionych plikow wazny kilka minut
    const token = await pb.files.getToken()
    const thumb = new URL(request.url).searchParams.has("thumb") ? "160x160" : ""
    const fileUrl = pb.files.getURL(ticket, ticket.photo, { token, thumb })

    const file = await fetch(fileUrl)
    if (!file.ok) {
      return new Response(null, { status: 404 })
    }

    return new Response(file.body, {
      headers: {
        "content-type": file.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "private, max-age=300",
      },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}
