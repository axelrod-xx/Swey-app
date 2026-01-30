import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _client: SupabaseClient | null = null;

/**
 * クライアント用。環境変数が無いときは null（ビルド時プリレンダ対策）。
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

/**
 * サーバー用（Server Actions / API）。毎回新規クライアントを返す。
 */
export function createServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Webhook 等、RLS を超えて subscriptions/purchases を更新する場合のみ使用。
 */
export function createServiceRoleClient(): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}
