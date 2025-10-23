import { cookies } from "next/headers"
import StravaLogInButton from "@/components/StravaLogInButton"
import ActivitiesList from "@/components/ActivitiesList"

export default async function Home() {
  const token = (await cookies()).get("strava_access_token")?.value

  return (
    <div className="space-y-4 p-3">
      {!token ? (
        <div className="w-xs">
          <StravaLogInButton />
        </div>
      ) : (
        <>
          <ActivitiesList />
        </>
      )}
    </div>
  )
}
