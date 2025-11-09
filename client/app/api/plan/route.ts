// client/app/api/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { PlanRequestBody, TrainingPlan } from "@/lib/types/runbuddy";

const BASE_URL = process.env.RUNBUDDY_API_BASE_URL;

if (!BASE_URL) {
  console.error("❌ RUNBUDDY_API_BASE_URL is not set in environment variables!");
  console.error("   Add this to client/.env.local:");
  console.error("   RUNBUDDY_API_BASE_URL=http://localhost:8000");
}

export async function POST(req: NextRequest) {
  try {
    // Check if BASE_URL is configured
    if (!BASE_URL) {
      console.error("Backend URL not configured");
      return NextResponse.json(
        { 
          error: "Backend API not configured",
          details: "RUNBUDDY_API_BASE_URL environment variable is missing. Add it to client/.env.local"
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as PlanRequestBody;
    
    console.log(`Calling FastAPI backend at: ${BASE_URL}/plan`);

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
    console.log("✓ Training plan generated successfully");
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in /api/plan route:", err);
    
    // Check if it's a connection error
    if (err instanceof TypeError && err.message.includes("fetch")) {
      return NextResponse.json(
        { 
          error: "Cannot connect to backend server",
          details: "Make sure the FastAPI server is running on http://localhost:8000"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
