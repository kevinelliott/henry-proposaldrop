import { createClient as createSupabaseClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
export const supabase = createSupabaseClient(url, anon)
export const getServiceClient = () => createSupabaseClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
