import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const client = await clerkClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const priceId = subscription.items.data[0]?.price.id

    const plan = priceId === process.env.STRIPE_PREMIUM_PRICE_ID ? 'premium' : 'standard'

    if (userId) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { plan, stripeSubscriptionId: subscription.id },
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.userId
    if (userId) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { plan: 'free', stripeSubscriptionId: null },
      })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.userId
    const priceId = subscription.items.data[0]?.price.id
    const plan = priceId === process.env.STRIPE_PREMIUM_PRICE_ID ? 'premium' : 'standard'
    const active = subscription.status === 'active'

    if (userId) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { plan: active ? plan : 'free' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
