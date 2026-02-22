import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Activity {
  _id: string;
  walletAddress: string;
  action: string;
  details?: string;
  timestamp: number;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function getActionEmoji(action: string): string {
  switch (action) {
    case "profile_created":
      return "🌟";
    case "fortune_claimed":
      return "🔮";
    case "match_made":
      return "💕";
    case "level_up":
      return "🎉";
    default:
      return "✨";
  }
}

function getActionLabel(action: string): string {
  switch (action) {
    case "profile_created":
      return "Created profile";
    case "fortune_claimed":
      return "Claimed fortune";
    case "match_made":
      return "Made a match";
    case "level_up":
      return "Leveled up";
    default:
      return action;
  }
}

export function ActivityFeed() {
  const activities = useQuery(api.activity.getRecentActivity) as Activity[] | undefined;

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>📡</span> Live Activity
        </h3>
        <p className="text-slate-400 text-sm text-center py-8">
          No activity yet. Be the first to create a profile!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="animate-pulse">📡</span> Live Activity
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors"
          >
            <span className="text-2xl">{getActionEmoji(activity.action)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">
                {getActionLabel(activity.action)}
              </p>
              <p className="text-slate-400 text-xs font-mono truncate">
                {activity.walletAddress.slice(0, 6)}...{activity.walletAddress.slice(-4)}
              </p>
              {activity.details && (
                <p className="text-slate-500 text-xs mt-1">{activity.details}</p>
              )}
            </div>
            <span className="text-slate-500 text-xs whitespace-nowrap">
              {formatRelativeTime(activity.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
