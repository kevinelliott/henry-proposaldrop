import Stripe from "stripe"
export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-02-25.clover" as any })
}

export const STRIPE_PLANS: Record<string, Record<string, string>> = {
  pro: {
    monthly: process.env.STRIPE_STARTER_PRICE_ID || 'price_placeholder_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_placeholder_pro_yearly',
  },
  team: {
    monthly: process.env.STRIPE_GROWTH_PRICE_ID || 'price_placeholder_team_monthly',
    yearly: process.env.STRIPE_TEAM_YEARLY_PRICE_ID || 'price_placeholder_team_yearly',
  },
}
