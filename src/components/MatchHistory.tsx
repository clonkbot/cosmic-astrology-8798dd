import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Match {
  _id: string;
  initiatorWallet: string;
  targetWallet: string;
  compatibility: number;
  timestamp: number;
}

interface MatchHistoryProps {
  walletAddress: string;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function getCompatibilityColor(score: number): string {
  if (score >= 80) return "from-pink-500 to-rose-600";
  if (score >= 60) return "from-purple-500 to-indigo-600";
  if (score >= 40) return "from-blue-500 to-cyan-600";
  if (score >= 20) return "from-emerald-500 to-teal-600";
  return "from-slate-500 to-gray-600";
}

export function MatchHistory({ walletAddress }: MatchHistoryProps) {
  const matches = useQuery(api.activity.getMatchHistory, { walletAddress }) as Match[] | undefined;

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>💕</span> Your Matches
        </h3>
        <p className="text-slate-400 text-sm text-center py-6">
          No matches yet. Use the Match panel to find your cosmic connections!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>💕</span> Your Matches
      </h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {matches.map((match) => {
          const otherWallet =
            match.initiatorWallet.toLowerCase() === walletAddress.toLowerCase()
              ? match.targetWallet
              : match.initiatorWallet;

          return (
            <div
              key={match._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/20"
            >
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold
                  bg-gradient-to-br ${getCompatibilityColor(match.compatibility)}
                `}
              >
                {match.compatibility}%
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-mono truncate">
                  {otherWallet.slice(0, 8)}...{otherWallet.slice(-6)}
                </p>
                <p className="text-slate-500 text-xs">
                  {formatRelativeTime(match.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
