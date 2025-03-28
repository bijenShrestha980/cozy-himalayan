import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  try {
    // Get the file from the request
    const file = await request.blob()

    // Determine folder based on searchParams or default to 'uploads'
    const folder = searchParams.get("folder") || "uploads"
    const fullPath = `${folder}/${Date.now()}-${filename.replace(/\s+/g, "-")}`

    // Upload to Vercel Blob
    const blob = await put(fullPath, file, {
      access: "public",
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Error uploading to Blob:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

