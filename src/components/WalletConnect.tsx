interface WalletConnectProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function WalletConnect({ onConnect, isConnecting }: WalletConnectProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* Animated logo */}
      <div className="relative mb-8 md:mb-12">
        <div
          className="text-8xl md:text-9xl"
          style={{ animation: "cosmic-pulse 4s ease-in-out infinite" }}
        >
          🌌
        </div>
        <div
          className="absolute -top-4 -right-4 text-4xl md:text-5xl"
          style={{ animation: "orbit 6s linear infinite" }}
        >
          ✨
        </div>
        <div
          className="absolute -bottom-2 -left-6 text-3xl md:text-4xl"
          style={{ animation: "orbit 8s linear infinite reverse" }}
        >
          🌟
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
        Cosmic Astrology
      </h1>
      <p className="text-slate-300 text-lg md:text-xl mb-8 md:mb-10 max-w-md">
        Discover your elemental spirit, claim daily fortunes, and find your cosmic match
        on Base
      </p>

      <button
        onClick={onConnect}
        disabled={isConnecting}
        className={`
          px-8 py-4 rounded-2xl font-bold text-lg
          bg-gradient-to-r from-blue-500 to-purple-600
          text-white shadow-lg shadow-purple-500/30
          hover:shadow-purple-500/50 hover:scale-105
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-3
        `}
      >
        {isConnecting ? (
          <>
            <span className="animate-spin text-2xl">⏳</span>
            Connecting...
          </>
        ) : (
          <>
            <span className="text-2xl">🔗</span>
            Connect Wallet
          </>
        )}
      </button>

      <p className="text-slate-500 text-sm mt-6">
        Base Network • Wallet-based identity
      </p>

      {/* Features preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16 max-w-2xl w-full">
        <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30">
          <span className="text-3xl md:text-4xl mb-3 block">🔥</span>
          <h3 className="text-white font-semibold mb-1">Elements</h3>
          <p className="text-slate-400 text-sm">
            Fire, Water, Air, or Earth — discover yours
          </p>
        </div>
        <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30">
          <span className="text-3xl md:text-4xl mb-3 block">🔮</span>
          <h3 className="text-white font-semibold mb-1">Fortunes</h3>
          <p className="text-slate-400 text-sm">Claim daily fortunes & level up</p>
        </div>
        <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30">
          <span className="text-3xl md:text-4xl mb-3 block">💕</span>
          <h3 className="text-white font-semibold mb-1">Match</h3>
          <p className="text-slate-400 text-sm">Find your cosmic compatibility</p>
        </div>
      </div>

      <style>{`
        @keyframes cosmic-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
