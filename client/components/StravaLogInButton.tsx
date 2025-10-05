"use client"
import { Button } from "@/components/ui/button"

export default function StravaLogInButton() {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
  const redirectUri = "http://localhost:3000/api/strava/exchange_token"

  const handleLogin = () => {
    const url =
      `https://www.strava.com/oauth/authorize` +
      `?client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&approval_prompt=force` +
      `&scope=read,activity:read_all`
    window.location.href = url
  }

  return (
    <Button onClick={handleLogin}>
      Log in to Strava
    </Button>
  )
}
