import { AstrologyProfile } from "../hooks/useContract";
import { ELEMENT_COLORS, ELEMENT_EMOJIS } from "../contract";
import { useState, useEffect } from "react";

interface ProfileCardProps {
  profile: AstrologyProfile;
  address: string;
  onClaimFortune: () => Promise<void>;
  isClaiming: boolean;
}

function formatTime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function ProfileCard({
  profile,
  address,
  onClaimFortune,
  isClaiming,
}: ProfileCardProps) {
  const [timeLeft, setTimeLeft] = useState(profile.timeUntilFortune);
  const colors = ELEMENT_COLORS[profile.element] || ELEMENT_COLORS.Fire;
  const emoji = ELEMENT_EMOJIS[profile.element] || "✨";

  useEffect(() => {
    setTimeLeft(profile.timeUntilFortune);

    if (profile.timeUntilFortune > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [profile.timeUntilFortune]);

  const canClaim = timeLeft === 0;
  const xpToNext = (profile.level + 1) * 100;
  const xpProgress = (profile.xp / xpToNext) * 100;

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl p-6 md:p-8
        bg-gradient-to-br ${colors.gradient}
        shadow-2xl shadow-black/50
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-8xl md:text-9xl">{emoji}</div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl md:text-5xl">{emoji}</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {profile.element} Spirit
                </h2>
                <p className="text-white/70 text-sm font-mono">Level {profile.level}</p>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-white/50 text-xs font-mono">WALLET</p>
            <p className="text-white font-mono text-sm break-all">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">XP</p>
            <p className="text-xl md:text-2xl font-bold text-white">{profile.xp}</p>
            <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            <p className="text-white/40 text-xs mt-1">
              {profile.xp}/{xpToNext}
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Energy</p>
            <p className="text-xl md:text-2xl font-bold text-white">⚡ {profile.energy}</p>
          </div>

          <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Lucky #</p>
            <p className="text-xl md:text-2xl font-bold text-white">🍀 {profile.luckyNumber}</p>
          </div>

          <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Win Streak</p>
            <p className="text-xl md:text-2xl font-bold text-white">🔥 {profile.winStreak}</p>
          </div>
        </div>

        {/* Fortune Button */}
        <div className="text-center">
          {canClaim ? (
            <button
              onClick={onClaimFortune}
              disabled={isClaiming}
              className={`
                w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-lg
                bg-white text-gray-900
                hover:bg-white/90 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-3 mx-auto
              `}
            >
              {isClaiming ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Claiming Fortune...
                </>
              ) : (
                <>
                  🔮 Claim Daily Fortune
                </>
              )}
            </button>
          ) : (
            <div className="bg-black/30 rounded-2xl p-4 inline-block w-full md:w-auto">
              <p className="text-white/50 text-sm mb-1">Next fortune available in</p>
              <p className="text-2xl md:text-3xl font-mono font-bold text-white">
                {formatTime(timeLeft)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
