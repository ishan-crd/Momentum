import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const createdAt = new Date().toISOString().slice(0, 10);
    return await ctx.db.insert("notes", {
      userId,
      title: "",
      content: "",
      createdAt,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, content }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const note = await ctx.db.get(id);
    if (!note || note.userId !== userId) throw new Error("Not found");
    const patch: { title?: string; content?: string } = {};
    if (title !== undefined) patch.title = title;
    if (content !== undefined) patch.content = content;
    if (Object.keys(patch).length) await ctx.db.patch(id, patch);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const note = await ctx.db.get(id);
    if (!note || note.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
