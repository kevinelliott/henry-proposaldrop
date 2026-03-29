import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const { createServiceClient } = await import("@/lib/supabase")
    const supabase = createServiceClient()
    await supabase
      .from("proposals")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by_name: body.name || "Unknown",
        accepted_by_ip: ip,
        updated_at: new Date().toISOString(),
      })
      .eq("public_token", params.token)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
