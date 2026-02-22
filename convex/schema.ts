import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Track user wallet connections for the dApp
  walletConnections: defineTable({
    walletAddress: v.string(),
    lastConnected: v.number(),
    profileExists: v.boolean(),
  }).index("by_wallet", ["walletAddress"]),

  // Store match history for display
  matchHistory: defineTable({
    initiatorWallet: v.string(),
    targetWallet: v.string(),
    compatibility: v.number(),
    timestamp: v.number(),
  })
    .index("by_initiator", ["initiatorWallet"])
    .index("by_target", ["targetWallet"]),

  // Activity feed for community engagement
  activityFeed: defineTable({
    walletAddress: v.string(),
    action: v.string(), // "profile_created", "fortune_claimed", "match_made", "level_up"
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
