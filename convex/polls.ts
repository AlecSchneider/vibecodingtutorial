import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'

const makeSlug = () => Math.random().toString(36).slice(2, 8)

export const create = mutation({
  args: {
    question: v.string(),
    answers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const question = args.question.trim()
    const answers = args.answers
      .map((answer) => answer.trim())
      .filter((answer) => answer.length > 0)

    if (question.length === 0) {
      throw new Error('Question is required.')
    }

    if (answers.length < 2) {
      throw new Error('At least 2 answers are required.')
    }

    let slug = makeSlug()
    let existing = await ctx.db
      .query('polls')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()

    while (existing !== null) {
      slug = makeSlug()
      existing = await ctx.db
        .query('polls')
        .withIndex('by_slug', (q) => q.eq('slug', slug))
        .unique()
    }

    const pollId = await ctx.db.insert('polls', {
      question,
      slug,
    })

    await Promise.all(
      answers.map((answer) =>
        ctx.db.insert('pollOptions', {
          pollId,
          text: answer,
        }),
      ),
    )

    return { pollId, slug }
  },
})

export const getBySlug = query({
  args: {
    slug: v.string(),
    userId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db
      .query('polls')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()

    if (poll === null) {
      return null
    }

    const options = await ctx.db
      .query('pollOptions')
      .withIndex('by_pollId', (q) => q.eq('pollId', poll._id))
      .collect()
    const votes = await ctx.db
      .query('pollVotes')
      .withIndex('by_pollId', (q) => q.eq('pollId', poll._id))
      .collect()
    let selectedVote: Doc<'pollVotes'> | null = null

    if (args.userId !== null) {
      const userId = args.userId
      selectedVote = await ctx.db
        .query('pollVotes')
        .withIndex('by_pollId_and_userId', (q) =>
          q.eq('pollId', poll._id).eq('userId', userId),
        )
        .unique()
    }

    const optionsWithVotes = options.map((option) => ({
      ...option,
      votes: votes.filter((vote) => vote.optionId === option._id).length,
    }))

    return {
      ...poll,
      options: optionsWithVotes,
      selectedOptionId: selectedVote?.optionId ?? null,
      totalVotes: votes.length,
    }
  },
})

export const vote = mutation({
  args: {
    pollId: v.id('polls'),
    optionId: v.id('pollOptions'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const option = await ctx.db.get('pollOptions', args.optionId)

    if (option === null || option.pollId !== args.pollId) {
      throw new Error('Invalid poll option.')
    }

    const existingVote = await ctx.db
      .query('pollVotes')
      .withIndex('by_pollId_and_userId', (q) =>
        q.eq('pollId', args.pollId).eq('userId', args.userId),
      )
      .unique()

    if (existingVote === null) {
      await ctx.db.insert('pollVotes', args)
      return null
    }

    await ctx.db.patch('pollVotes', existingVote._id, {
      optionId: args.optionId,
    })

    return null
  },
})
