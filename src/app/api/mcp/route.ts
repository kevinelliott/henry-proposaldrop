import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const MCP_TOOLS = [
  { name: "list_proposals", description: "List all proposals for the authenticated user", inputSchema: { type: "object", properties: {} } },
  { name: "create_proposal", description: "Create a new proposal", inputSchema: { type: "object", properties: { title: { type: "string" }, client_name: { type: "string" }, total_amount: { type: "number" } }, required: ["title", "client_name"] } },
  { name: "get_proposal", description: "Get proposal details by ID", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
  { name: "update_proposal_status", description: "Update proposal status", inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["draft", "sent", "viewed", "accepted", "declined"] } }, required: ["id", "status"] } },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, params } = body

    if (method === "tools/list") {
      return NextResponse.json({ tools: MCP_TOOLS })
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params || {}
      return NextResponse.json({
        content: [{ type: "text", text: JSON.stringify({ tool: name, args, result: "Demo mode — connect to Supabase for live data" }) }]
      })
    }

    return NextResponse.json({ error: "Unknown method" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
