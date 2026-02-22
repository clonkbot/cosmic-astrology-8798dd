import { useState } from "react";
import { ethers } from "ethers";

interface MatchPanelProps {
  onMatch: (address: string) => Promise<number>;
  onCheckCompatibility: (address: string) => Promise<number>;
  disabled: boolean;
}

interface MatchResult {
  address: string;
  compatibility: number;
  timestamp: number;
}

export function MatchPanel({
  onMatch,
  onCheckCompatibility,
  disabled,
}: MatchPanelProps) {
  const [targetAddress, setTargetAddress] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidAddress = ethers.utils.isAddress(targetAddress);

  const handleCheckCompatibility = async () => {
    if (!isValidAddress) return;

    setIsChecking(true);
    setError(null);

    try {
      const compatibility = await onCheckCompatibility(targetAddress);
      setMatchResult({
        address: targetAddress,
        compatibility,
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to check compatibility");
    } finally {
      setIsChecking(false);
    }
  };

  const handleMatch = async () => {
    if (!isValidAddress) return;

    setIsMatching(true);
    setError(null);

    try {
      const compatibility = await onMatch(targetAddress);
      setMatchResult({
        address: targetAddress,
        compatibility,
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes("UNPREDICTABLE_GAS_LIMIT")) {
        setError("Transaction failed. The target may not have a profile.");
      } else {
        setError(error.message || "Failed to match");
      }
    } finally {
      setIsMatching(false);
    }
  };

  const getCompatibilityEmoji = (score: number): string => {
    if (score >= 80) return "💕";
    if (score >= 60) return "✨";
    if (score >= 40) return "🌟";
    if (score >= 20) return "💫";
    return "🌙";
  };

  const getCompatibilityLabel = (score: number): string => {
    if (score >= 80) return "Perfect Match!";
    if (score >= 60) return "Great Harmony";
    if (score >= 40) return "Good Vibes";
    if (score >= 20) return "Some Connection";
    return "Cosmic Mystery";
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-6 md:p-8 border border-purple-500/20">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <span className="text-3xl">💫</span>
        Cosmic Match
      </h3>
      <p className="text-purple-200/70 text-sm mb-6">
        Enter another wallet address to check your astrology compatibility and match!
      </p>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => {
              setTargetAddress(e.target.value);
              setError(null);
              setMatchResult(null);
            }}
            placeholder="0x... (wallet address)"
            disabled={disabled}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-black/30 border
              ${isValidAddress ? "border-green-500/50" : targetAddress ? "border-red-500/50" : "border-purple-500/30"}
              text-white placeholder-purple-300/50
              font-mono text-sm
              focus:outline-none focus:border-purple-400
              disabled:opacity-50
            `}
          />
          {targetAddress && !isValidAddress && (
            <p className="text-red-400 text-xs mt-2">Invalid Ethereum address</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCheckCompatibility}
            disabled={!isValidAddress || isChecking || disabled}
            className={`
              flex-1 px-6 py-3 rounded-xl font-bold
              bg-purple-500/30 text-purple-200
              hover:bg-purple-500/50 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isChecking ? (
              <>
                <span className="animate-spin">🔮</span>
                Checking...
              </>
            ) : (
              <>
                👀 Check Score
              </>
            )}
          </button>

          <button
            onClick={handleMatch}
            disabled={!isValidAddress || isMatching || disabled}
            className={`
              flex-1 px-6 py-3 rounded-xl font-bold
              bg-gradient-to-r from-pink-500 to-purple-600 text-white
              hover:opacity-90 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isMatching ? (
              <>
                <span className="animate-spin">⏳</span>
                Matching...
              </>
            ) : (
              <>
                💕 Match Now
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {matchResult && (
          <div
            className={`
              bg-gradient-to-r from-pink-500/20 to-purple-500/20
              border border-pink-500/30 rounded-2xl p-6
              text-center animate-fade-in
            `}
          >
            <p className="text-5xl mb-3">
              {getCompatibilityEmoji(matchResult.compatibility)}
            </p>
            <p className="text-3xl font-bold text-white mb-2">
              {matchResult.compatibility}% Compatible
            </p>
            <p className="text-purple-200 text-lg mb-3">
              {getCompatibilityLabel(matchResult.compatibility)}
            </p>
            <p className="text-purple-300/50 text-xs font-mono break-all">
              with {matchResult.address.slice(0, 10)}...{matchResult.address.slice(-8)}
            </p>
          </div>
        )}
      </div>

      {disabled && (
        <div className="mt-4 text-center text-purple-300/50 text-sm">
          Create your profile first to match with others
        </div>
      )}
    </div>
  );
}
