import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { createServiceClient } = await import("@/lib/supabase")
    const supabase = createServiceClient()
    await supabase
      .from("proposals")
      .update({
        status: "declined",
        declined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("public_token", params.token)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
