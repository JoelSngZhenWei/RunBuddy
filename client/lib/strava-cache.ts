// lib/strava-cache.ts
import { redis } from "./redis"

type Activity = any // tighten later

const KEY = (athleteId: string | number, page: string, per: string) =>
  `strava:activities:${athleteId}:p${page}:pp${per}:v1`

const TTL_SECONDS = 60 * 10 // 10 minutes (tune to taste)

export async function fetchStravaActivities(
  accessToken: string,
  page = "1",
  perPage = "200"
): Promise<Activity[]> {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  )
  if (!res.ok) throw new Error(`Strava error ${res.status}`)
  return res.json()
}

export async function getCachedActivities(
  athleteId: string | number,
  page = "1",
  perPage = "200"
) {
  if (!redis) return null // Skip cache if Redis not configured
  
  try {
    const key = KEY(athleteId, page, perPage)
    const cached = await redis.get<{ at: number; data: Activity[] }>(key)
    return cached
  } catch (error) {
    console.warn("Failed to read from cache:", error)
    return null
  }
}

export async function setCachedActivities(
  athleteId: string | number,
  page: string,
  perPage: string,
  data: Activity[]
) {
  if (!redis) return // Skip cache if Redis not configured
  
  try {
    const key = KEY(athleteId, page, perPage)
    await redis.set(key, { at: Date.now(), data }, { ex: TTL_SECONDS })
  } catch (error) {
    console.warn("Failed to write to cache:", error)
    // Non-fatal - continue without caching
  }
}

export async function fetchAndCacheActivitiesNow(
  accessToken: string,
  athleteId: string | number,
  page = "1",
  perPage = "200"
) {
  console.log(`Fetching activities from Strava (page=${page}, perPage=${perPage})...`)
  const data = await fetchStravaActivities(accessToken, page, perPage)
  console.log(`✓ Received ${data?.length || 0} activities from Strava`)
  
  // Try to cache but don't fail if it doesn't work
  await setCachedActivities(athleteId, page, perPage, data)
  
  return data
}
