import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const statusValidator = v.union(
  v.literal("todo"),
  v.literal("in-progress"),
  v.literal("completed")
);
const priorityValidator = v.optional(
  v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    status: statusValidator,
    priority: priorityValidator,
    dueDate: v.optional(v.string()),
    isTopThree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("tasks", {
      userId,
      title: args.title.trim(),
      status: args.status ?? "todo",
      priority: args.priority,
      dueDate: args.dueDate,
      isTopThree: args.isTopThree,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    status: v.optional(statusValidator),
    priority: priorityValidator,
    dueDate: v.optional(v.string()),
    isTopThree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const { id, ...patch } = args;
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (patch.title !== undefined) updates.title = patch.title.trim();
    if (patch.status !== undefined) {
      updates.status = patch.status;
      if (patch.status === "completed") {
        updates.completedAt = Date.now();
      } else if (task.status === "completed") {
        updates.completedAt = undefined;
      }
    }
    if (patch.priority !== undefined) updates.priority = patch.priority;
    if (patch.dueDate !== undefined) updates.dueDate = patch.dueDate;
    if (patch.isTopThree !== undefined) updates.isTopThree = patch.isTopThree;
    if (Object.keys(updates).length) await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});

export const listTopThree = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const all = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const top = all.filter((t) => t.isTopThree === true).slice(0, 3);
    if (top.length >= 3) return top;
    const rest = all.filter((t) => t.isTopThree !== true && t.status !== "completed");
    return [...top, ...rest].slice(0, 3);
  },
});
