import { useState } from "react";

interface CreateProfileProps {
  onCreate: () => Promise<void>;
  isCreating: boolean;
}

export function CreateProfile({ onCreate, isCreating }: CreateProfileProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleCreate = async () => {
    setShowWarning(false);
    try {
      await onCreate();
    } catch (err: unknown) {
      const error = err as Error;
      if (
        error.message.includes("UNPREDICTABLE_GAS_LIMIT") ||
        error.message.includes("already exists")
      ) {
        setShowWarning(true);
      }
    }
  };

  return (
    <div className="text-center py-8 md:py-12">
      <div
        className="relative inline-block mb-6 md:mb-8"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <span className="text-6xl md:text-8xl">✨</span>
        <span
          className="absolute -top-2 -right-2 text-3xl md:text-4xl"
          style={{ animation: "sparkle 1.5s ease-in-out infinite" }}
        >
          🌟
        </span>
      </div>

      <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
        Begin Your Cosmic Journey
      </h2>
      <p className="text-slate-300 text-base md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
        Create your astrology profile to discover your element, unlock daily fortunes,
        and match with other cosmic travelers.
      </p>

      {showWarning && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6 max-w-sm mx-auto text-yellow-200 text-sm">
          ⚠️ Profile may already exist. Please refresh the page to check.
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={isCreating}
        className={`
          px-8 py-4 rounded-2xl font-bold text-lg
          bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500
          text-white shadow-lg shadow-purple-500/25
          hover:shadow-purple-500/40 hover:scale-105
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          flex items-center gap-3 mx-auto
        `}
      >
        {isCreating ? (
          <>
            <span className="animate-spin text-2xl">🌀</span>
            Creating Profile...
          </>
        ) : (
          <>
            <span className="text-2xl">🚀</span>
            Create My Profile
          </>
        )}
      </button>

      <p className="text-slate-500 text-sm mt-4">
        Only Base network gas required • No additional fees
      </p>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
