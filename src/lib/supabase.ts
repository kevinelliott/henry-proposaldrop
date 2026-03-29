import { createClient, SupabaseClient } from "@supabase/supabase-js"
function getUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co" }
function getAnonKey() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key" }
function getServiceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key" }
export function getSupabase(): SupabaseClient { return createClient(getUrl(), getAnonKey()) }
export function createServiceClient(): SupabaseClient { return createClient(getUrl(), getServiceKey()) }
let _sb: SupabaseClient | null = null
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) { if (!_sb) _sb = createClient(getUrl(), getAnonKey()); return (_sb as any)[prop] }
})

let _admin: SupabaseClient | null = null
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop) { if (!_admin) _admin = createClient(getUrl(), getServiceKey()); return (_admin as any)[prop] }
})
