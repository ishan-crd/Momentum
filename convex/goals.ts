import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    timeframe: v.string(),
    targetDate: v.string(),
    linkedTaskIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("goals", {
      userId,
      title: args.title.trim(),
      category: args.category,
      timeframe: args.timeframe,
      targetDate: args.targetDate,
      linkedTaskIds: args.linkedTaskIds,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("goals"),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    timeframe: v.optional(v.string()),
    targetDate: v.optional(v.string()),
    linkedTaskIds: v.optional(v.array(v.id("tasks"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const { id, ...patch } = args;
    const goal = await ctx.db.get(id);
    if (!goal || goal.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const goal = await ctx.db.get(id);
    if (!goal || goal.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
