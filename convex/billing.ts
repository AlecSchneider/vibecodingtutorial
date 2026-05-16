import { StripeSubscriptions } from '@convex-dev/stripe'
import { v } from 'convex/values'
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from './_generated/server'
import { components, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

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

const getBillingUserIds = (identity: {
  tokenIdentifier: string
  subject: string
}) => Array.from(new Set([identity.tokenIdentifier, identity.subject]))

export const getCurrentStripeCustomer = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userStripeCustomers')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique()
  },
})

export const setCurrentStripeCustomer = internalMutation({
  args: {
    userId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userStripeCustomers')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique()

    if (existing) {
      await ctx.db.patch('userStripeCustomers', existing._id, {
        stripeCustomerId: args.stripeCustomerId,
      })
      return
    }

    await ctx.db.insert('userStripeCustomers', {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
    })
  },
})

export const hasAiAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      return false
    }

    const userIds = getBillingUserIds(identity)
    const subscriptions = (
      await Promise.all(
        userIds.map((userId) =>
          ctx.runQuery(components.stripe.public.listSubscriptionsByUserId, {
            userId,
          }),
        ),
      )
    ).flat()
    const hasActiveSubscription = subscriptions.some((subscription) =>
      activeSubscriptionStatuses.has(subscription.status),
    )

    if (hasActiveSubscription) {
      return true
    }

    const payments = (
      await Promise.all(
        userIds.map((userId) =>
          ctx.runQuery(components.stripe.public.listPaymentsByUserId, {
            userId,
          }),
        ),
      )
    ).flat()

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

    const userId = identity.tokenIdentifier
    const mappedCustomer: {
      _id: Id<'userStripeCustomers'>
      _creationTime: number
      userId: string
      stripeCustomerId: string
    } | null = await ctx.runQuery(
      internal.billing.getCurrentStripeCustomer,
      { userId },
    )
    const customerId: string =
      mappedCustomer?.stripeCustomerId ??
      (
        await stripeClient.getOrCreateCustomer(ctx, {
          userId,
          email: identity.email,
          name: identity.name,
        })
      ).customerId

    if (mappedCustomer === null) {
      await ctx.runMutation(internal.billing.setCurrentStripeCustomer, {
        userId,
        stripeCustomerId: customerId,
      })
    }

    const appOrigin = getAppOrigin(args.origin)
    const checkoutArgs: {
      priceId: string
      customerId: string
      mode: 'payment'
      successUrl: string
      cancelUrl: string
      paymentIntentMetadata: Record<string, string>
    } = {
      priceId,
      customerId,
      mode: 'payment' as const,
      successUrl: `${appOrigin}/new?checkout=success`,
      cancelUrl: `${appOrigin}/new?checkout=cancelled`,
      paymentIntentMetadata: {
        userId,
        feature: 'ai_answers',
      },
    }

    try {
      const checkout = await stripeClient.createCheckoutSession(
        ctx,
        checkoutArgs,
      )
      await ctx.runMutation(internal.billing.setCurrentStripeCustomer, {
        userId,
        stripeCustomerId: checkoutArgs.customerId,
      })
      return checkout
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.includes('No such customer')
      ) {
        throw error
      }
    }

    const replacementCustomer = await stripeClient.createCustomer(ctx, {
      email: identity.email,
      name: identity.name,
      metadata: { userId },
    })
    await ctx.runMutation(internal.billing.setCurrentStripeCustomer, {
      userId,
      stripeCustomerId: replacementCustomer.customerId,
    })

    return await stripeClient.createCheckoutSession(ctx, {
      ...checkoutArgs,
      customerId: replacementCustomer.customerId,
    })
  },
})
