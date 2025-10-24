"use client"

import { Button } from "@/components/ui/button"

export default function SimulateLogInButton() {
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/strava/simulate_login", { method: "POST" })
      if (res.ok) {
        window.location.reload()
      } else {
        console.error("Failed to simulate login")
      }
    } catch (err) {
      console.error("Error simulating login:", err)
    }
  }

  return (
    <Button onClick={handleLogin} className="w-full">
      Simulate Log In
    </Button>
  )
}
