import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { createServiceClient } = await import("@/lib/supabase")
    const supabase = createServiceClient()
    const { data: proposal } = await supabase
      .from("proposals")
      .select("id, status, view_count, first_viewed_at")
      .eq("public_token", params.token)
      .single()

    if (!proposal) return NextResponse.json({ ok: true })

    const updates: Record<string, unknown> = {
      view_count: (proposal.view_count || 0) + 1,
      updated_at: new Date().toISOString(),
    }
    if (!proposal.first_viewed_at) updates.first_viewed_at = new Date().toISOString()
    if (proposal.status === "sent") updates.status = "viewed"

    await supabase.from("proposals").update(updates).eq("id", proposal.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
