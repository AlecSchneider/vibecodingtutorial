import { query } from './_generated/server'

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      return null
    }

    return {
      userId: identity.subject,
      email: identity.email ?? null,
      name: identity.name ?? null,
    }
  },
})
