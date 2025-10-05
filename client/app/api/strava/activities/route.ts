import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const strava_access_token = (await cookies()).get("strava_access_token")?.value;
  if (!strava_access_token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? "30"; // up to 200

  const upstream = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}`,
    { headers: { Authorization: `Bearer ${strava_access_token}` } }
  );

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
