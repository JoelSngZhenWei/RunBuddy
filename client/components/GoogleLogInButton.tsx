"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function GoogleLogInButton() {
  const handleLogin = () => {
    window.location.href = "/api/google/authorize"
  }

  return (
    <Button 
      onClick={handleLogin} 
      className="bg-blue-600 hover:bg-blue-700 w-full"
      variant="default"
    >
      <Calendar className="mr-2 h-4 w-4" />
      Connect Google Calendar
    </Button>
  )
}

