import { cookies } from "next/headers"
import StravaLogInButton from "@/components/StravaLogInButton"
import ActivitiesList from "@/components/ActivitiesList"
import SimulateLogInButton from "@/components/SimulateLogInButton"

export default async function Home() {
  const token = (await cookies()).get("strava_access_token")?.value

  return (
    <div className="space-y-4 p-3">
      {!token ? (
        <div className="w-xs grid grid-cols-2 gap-2">
          <StravaLogInButton />

          <div className="flex flex-col items-start">
            <SimulateLogInButton />
            <p className="text-sm text-muted-foreground">
              Use this if you don't have a Strava account
            </p>
          </div>
        </div>

      ) : (
        <>
          <ActivitiesList />
        </>
      )}
    </div>
  )
}
