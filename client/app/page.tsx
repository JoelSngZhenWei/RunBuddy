import { cookies } from "next/headers"
import StravaLogInButton from "@/components/StravaLogInButton"
import ActivitiesList from "@/components/ActivitiesList"

export default function Home() {
  const token = cookies().get("strava_access_token")?.value

  return (
    <main className="space-y-4 p-6">
      {!token ? (
        <StravaLogInButton />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Connected to Strava</p>
          <ActivitiesList />
        </>
      )}
    </main>
  )
}
