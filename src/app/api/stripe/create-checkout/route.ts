import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const formData = await req.formData()
  const priceId = formData.get('priceId') as string

  if (!priceId) return NextResponse.json({ error: 'priceId required' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user?.emailAddresses[0]?.emailAddress,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    locale: 'ja',
  })

  return NextResponse.redirect(session.url!, 303)
}
