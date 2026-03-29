export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined'

export interface Proposal {
  id: string
  user_id: string
  public_token: string
  title: string
  client_name: string
  client_email?: string
  status: ProposalStatus
  cover_tagline?: string
  intro?: string
  scope?: string
  deliverables?: string
  timeline?: string
  terms?: string
  total_amount: number
  currency: string
  valid_until?: string
  first_viewed_at?: string
  view_count: number
  accepted_at?: string
  accepted_by_name?: string
  accepted_by_ip?: string
  declined_at?: string
  follow_up_sent_at?: string
  created_at: string
  updated_at: string
  proposal_items?: ProposalItem[]
}

export interface ProposalItem {
  id: string
  proposal_id: string
  sort_order: number
  name: string
  description?: string
  quantity: number
  unit_price: number
  total: number
}
