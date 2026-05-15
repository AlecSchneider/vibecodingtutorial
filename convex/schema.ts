import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  polls: defineTable({
    question: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),
  pollOptions: defineTable({
    pollId: v.id("polls"),
    text: v.string(),
  }).index("by_pollId", ["pollId"]),
  pollVotes: defineTable({
    pollId: v.id("polls"),
    optionId: v.id("pollOptions"),
    userId: v.string(),
  })
    .index("by_pollId", ["pollId"])
    .index("by_pollId_and_userId", ["pollId", "userId"])
    .index("by_optionId", ["optionId"]),
});
