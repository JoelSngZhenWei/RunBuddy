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
      `&scope=read_all,activity:read_all,profile:read_all`
    window.location.href = url
  }

  return (
    <Button onClick={handleLogin} className="bg-strava hover:bg-strava/80 w-full">
      Log in to Strava
    </Button>
  )
}
