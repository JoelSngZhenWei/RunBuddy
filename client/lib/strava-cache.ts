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
  const key = KEY(athleteId, page, perPage)
  const cached = await redis.get<{ at: number; data: Activity[] }>(key)
  return cached
}

export async function setCachedActivities(
  athleteId: string | number,
  page: string,
  perPage: string,
  data: Activity[]
) {
  const key = KEY(athleteId, page, perPage)
  await redis.set(key, { at: Date.now(), data }, { ex: TTL_SECONDS })
}

export async function fetchAndCacheActivitiesNow(
  accessToken: string,
  athleteId: string | number,
  page = "1",
  perPage = "200"
) {
  const data = await fetchStravaActivities(accessToken, page, perPage)
  await setCachedActivities(athleteId, page, perPage, data)
  return data
}
