import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const image = formData.get("image") as Blob

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert blob to base64
    const buffer = Buffer.from(await image.arrayBuffer())
    const base64Image = buffer.toString("base64")

    // Call remove.bg API
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.REMOVEBG_API_KEY!,
      },
      body: JSON.stringify({
        image_file_b64: base64Image,
        size: "regular",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Remove.bg API error: ${error}` }, { status: response.status })
    }

    const data = await response.arrayBuffer()
    const base64 = Buffer.from(data).toString("base64")

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    })
  } catch (error) {
    console.error("Error removing background:", error)
    return NextResponse.json({ error: "Failed to remove background" }, { status: 500 })
  }
}

