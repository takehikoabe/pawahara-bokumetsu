import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder', {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  standard: {
    priceId: process.env.STRIPE_STANDARD_PRICE_ID!,
    name: 'スタンダード',
    metadata: { plan: 'standard' },
  },
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    name: 'プレミアム',
    metadata: { plan: 'premium' },
  },
}
