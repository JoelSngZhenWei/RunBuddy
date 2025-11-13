export async function loadRecentRunsFromCached({
    page = "1",
    perPage = "200",
    limit = 10,
    refresh = false,
  }: {
    page?: string;
    perPage?: string;
    limit?: number;
    refresh?: boolean; // pass true to force refetch from Strava
  }) {
    const q = new URLSearchParams({
      page,
      per_page: perPage,
      ...(refresh ? { refresh: "1" } : {}),
    });
    const res = await fetch(`/api/strava/activities?${q.toString()}`, {
      cache: "no-store",
    });
  
    if (res.status === 401) {
      // Not authenticated → you can trigger /api/simulate_login in dev
      // or show a toast asking the user to connect Strava
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || "Not authenticated with Strava");
    }
  
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || `Failed to load activities (${res.status})`);
    }
  
    const body = await res.json(); // { cached, at, data, ... }
    const { activitiesToRecentRuns } = await import("@/lib/strava-map");
    return activitiesToRecentRuns(body.data, limit);
  }