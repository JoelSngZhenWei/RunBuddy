// client/app/api/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { PlanRequestBody, TrainingPlan } from "@/lib/types/runbuddy";

const BASE_URL = process.env.RUNBUDDY_API_BASE_URL;

if (!BASE_URL) {
  // This will show in logs if you forget the env var
  console.warn("RUNBUDDY_API_BASE_URL is not set");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PlanRequestBody;

    const res = await fetch(`${BASE_URL}/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("FastAPI /plan error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to generate plan", details: text },
        { status: res.status }
      );
    }

    const data = (await res.json()) as TrainingPlan;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in /api/plan route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
