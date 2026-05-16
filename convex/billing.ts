import { StripeSubscriptions } from '@convex-dev/stripe'
import { v } from 'convex/values'
import { action, query } from './_generated/server'
import { components } from './_generated/api'

declare const process: {
  env: {
    AI_STRIPE_PRICE_ID?: string
    APP_ORIGIN?: string
  }
}

const stripeClient = new StripeSubscriptions(components.stripe, {})

const activeSubscriptionStatuses = new Set(['active', 'trialing'])
const paidPaymentStatuses = new Set(['succeeded'])

const getAppOrigin = (origin: string | null) =>
  origin ?? process.env.APP_ORIGIN ?? 'https://www.vibecodingtutorial.de'

export const hasAiAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      return false
    }

    const subscriptions = await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject },
    )
    const hasActiveSubscription = subscriptions.some((subscription) =>
      activeSubscriptionStatuses.has(subscription.status),
    )

    if (hasActiveSubscription) {
      return true
    }

    const payments = await ctx.runQuery(
      components.stripe.public.listPaymentsByUserId,
      { userId: identity.subject },
    )

    return payments.some((payment) => paidPaymentStatuses.has(payment.status))
  },
})

export const createAiCheckout = action({
  args: {
    origin: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const priceId = process.env.AI_STRIPE_PRICE_ID

    if (identity === null) {
      throw new Error('Not authenticated')
    }

    if (priceId === undefined) {
      throw new Error('AI_STRIPE_PRICE_ID is not configured')
    }

    if (!priceId.startsWith('price_')) {
      throw new Error('AI_STRIPE_PRICE_ID must be a Stripe Price ID')
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    })
    const appOrigin = getAppOrigin(args.origin)

    return await stripeClient.createCheckoutSession(ctx, {
      priceId,
      customerId: customer.customerId,
      mode: 'payment',
      successUrl: `${appOrigin}/new?checkout=success`,
      cancelUrl: `${appOrigin}/new?checkout=cancelled`,
      paymentIntentMetadata: {
        userId: identity.subject,
        feature: 'ai_answers',
      },
    })
  },
})
