import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log an activity
export const logActivity = mutation({
  args: {
    walletAddress: v.string(),
    action: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityFeed", {
      walletAddress: args.walletAddress.toLowerCase(),
      action: args.action,
      details: args.details,
      timestamp: Date.now(),
    });
  },
});

// Get recent activity feed
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("activityFeed")
      .withIndex("by_timestamp")
      .order("desc")
      .take(20);
  },
});

// Log a match
export const logMatch = mutation({
  args: {
    initiatorWallet: v.string(),
    targetWallet: v.string(),
    compatibility: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("matchHistory", {
      initiatorWallet: args.initiatorWallet.toLowerCase(),
      targetWallet: args.targetWallet.toLowerCase(),
      compatibility: args.compatibility,
      timestamp: Date.now(),
    });
  },
});

// Get match history for a wallet
export const getMatchHistory = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const asInitiator = await ctx.db
      .query("matchHistory")
      .withIndex("by_initiator", (q) =>
        q.eq("initiatorWallet", args.walletAddress.toLowerCase())
      )
      .order("desc")
      .take(10);

    const asTarget = await ctx.db
      .query("matchHistory")
      .withIndex("by_target", (q) =>
        q.eq("targetWallet", args.walletAddress.toLowerCase())
      )
      .order("desc")
      .take(10);

    const all = [...asInitiator, ...asTarget].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    return all.slice(0, 10);
  },
});
