// app/api/google/logout/route.ts
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Delete all Google-related cookies
    cookieStore.delete("google_access_token")
    cookieStore.delete("google_refresh_token")
    cookieStore.delete("google_user_email")
    cookieStore.delete("google_user_name")
    cookieStore.delete("google_user_picture")

    return NextResponse.json({ message: "Successfully logged out from Google Calendar" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

