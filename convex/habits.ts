import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const defaultWeekly = [false, false, false, false, false, false, false];

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("habits", {
      userId,
      name: name.trim(),
      streak: 0,
      completedToday: false,
      weeklyCompletion: defaultWeekly,
    });
  },
});

export const toggleToday = mutation({
  args: {
    id: v.id("habits"),
    todayIndex: v.number(),
    completedToday: v.boolean(),
  },
  handler: async (ctx, { id, todayIndex, completedToday }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const habit = await ctx.db.get(id);
    if (!habit || habit.userId !== userId) throw new Error("Not found");
    const weeklyCompletion = [...habit.weeklyCompletion];
    weeklyCompletion[todayIndex] = completedToday;
    await ctx.db.patch(id, { completedToday, weeklyCompletion });
  },
});

export const update = mutation({
  args: {
    id: v.id("habits"),
    name: v.optional(v.string()),
    streak: v.optional(v.number()),
    completedToday: v.optional(v.boolean()),
    weeklyCompletion: v.optional(v.array(v.boolean())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const { id, ...patch } = args;
    const habit = await ctx.db.get(id);
    if (!habit || habit.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, patch);
  },
});
