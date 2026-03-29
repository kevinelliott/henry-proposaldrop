// ─── Database Types ─────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string | null;
  company_name: string | null;
  plan: 'free' | 'pro' | 'team';
  stripe_customer_id: string | null;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Proposal {
  id: string;
  user_id: string;
  token: string;
  title: string;
  client_name: string | null;
  client_email: string | null;
  client_company: string | null;
  description: string | null;
  line_items: LineItem[];
  terms: string | null;
  notes: string | null;
  status: ProposalStatus;
  total_amount: number;
  accepted_at: string | null;
  accepted_signature: string | null;
  accepted_ip: string | null;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';

export interface ProposalView {
  id: string;
  proposal_id: string;
  viewed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  duration_seconds: number | null;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface ProposalFormData {
  title: string;
  client_name: string;
  client_email: string;
  client_company: string;
  description: string;
  line_items: LineItem[];
  terms: string;
  notes: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ProposalListResponse {
  proposals: Proposal[];
  total: number;
  page: number;
  per_page: number;
}

// ─── Dashboard Types ─────────────────────────────────────────────────────────

export interface DashboardStats {
  total_proposals: number;
  pipeline_value: number;
  accepted_this_month: number;
  conversion_rate: number;
}

// ─── Stripe Types ────────────────────────────────────────────────────────────

export interface CheckoutSessionRequest {
  plan: 'pro' | 'team';
  interval: 'monthly' | 'yearly';
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_proposals: number;
  accepted_proposals: number;
  active_subscriptions: number;
  mrr: number;
}

// ─── Supabase Database Type Map ──────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'plan'> & { plan?: string };
        Update: Partial<Profile>;
      };
      proposals: {
        Row: Proposal;
        Insert: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'token'> & {
          token?: string;
        };
        Update: Partial<Omit<Proposal, 'id' | 'created_at'>>;
      };
      proposal_views: {
        Row: ProposalView;
        Insert: Omit<ProposalView, 'id' | 'viewed_at'>;
        Update: Partial<ProposalView>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// ─── MCP Types ───────────────────────────────────────────────────────────────

export interface McpRequest {
  method: string;
  params?: Record<string, unknown>;
  id?: string | number;
}

export interface McpResponse {
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
  id?: string | number;
}
