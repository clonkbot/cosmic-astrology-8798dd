import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record a wallet connection
export const recordConnection = mutation({
  args: {
    walletAddress: v.string(),
    profileExists: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("walletConnections")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastConnected: Date.now(),
        profileExists: args.profileExists,
      });
    } else {
      await ctx.db.insert("walletConnections", {
        walletAddress: args.walletAddress.toLowerCase(),
        lastConnected: Date.now(),
        profileExists: args.profileExists,
      });
    }
  },
});

// Get wallet connection info
export const getConnection = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walletConnections")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .first();
  },
});
