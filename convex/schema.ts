import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    streak: v.number(),
    completedToday: v.boolean(),
    weeklyCompletion: v.array(v.boolean()),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    status: v.union(v.literal("todo"), v.literal("in-progress"), v.literal("completed")),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.string()),
    isTopThree: v.optional(v.boolean()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  goals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    category: v.string(),
    timeframe: v.string(),
    targetDate: v.string(),
    linkedTaskIds: v.array(v.id("tasks")),
  }).index("by_user", ["userId"]),
});
