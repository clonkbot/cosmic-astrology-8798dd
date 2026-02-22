import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useContract } from "./hooks/useContract";
import { NetworkBadge } from "./components/NetworkBadge";
import { WalletConnect } from "./components/WalletConnect";
import { CreateProfile } from "./components/CreateProfile";
import { ProfileCard } from "./components/ProfileCard";
import { MatchPanel } from "./components/MatchPanel";
import { MatchHistory } from "./components/MatchHistory";
import { ActivityFeed } from "./components/ActivityFeed";
import { CONTRACT_ADDRESS } from "./contract";

export default function App() {
  const {
    address,
    chainId,
    isConnecting,
    isLoading,
    error,
    profile,
    profileExists,
    isCorrectNetwork,
    connect,
    disconnect,
    switchToBase,
    createProfile,
    claimFortune,
    matchWith,
    getCompatibility,
    fetchProfile,
  } = useContract();

  const [isCreating, setIsCreating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Convex mutations for activity tracking
  const recordConnection = useMutation(api.wallet.recordConnection);
  const logActivity = useMutation(api.activity.logActivity);
  const logMatch = useMutation(api.activity.logMatch);

  // Track wallet connection
  useEffect(() => {
    if (address && isCorrectNetwork) {
      recordConnection({
        walletAddress: address,
        profileExists: profileExists,
      });
    }
  }, [address, isCorrectNetwork, profileExists, recordConnection]);

  const handleCreateProfile = async () => {
    setIsCreating(true);
    setActionError(null);
    try {
      await createProfile();
      if (address) {
        await logActivity({
          walletAddress: address,
          action: "profile_created",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setActionError(error.message || "Failed to create profile");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClaimFortune = async () => {
    setIsClaiming(true);
    setActionError(null);
    try {
      await claimFortune();
      if (address) {
        await logActivity({
          walletAddress: address,
          action: "fortune_claimed",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes("UNPREDICTABLE_GAS_LIMIT")) {
        setActionError("Fortune not available yet. Please wait for cooldown.");
      } else {
        setActionError(error.message || "Failed to claim fortune");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleMatch = async (targetAddress: string): Promise<number> => {
    setActionError(null);
    try {
      const compatibility = await matchWith(targetAddress);
      if (address) {
        await logMatch({
          initiatorWallet: address,
          targetWallet: targetAddress,
          compatibility,
        });
        await logActivity({
          walletAddress: address,
          action: "match_made",
          details: `${compatibility}% compatibility`,
        });
      }
      return compatibility;
    } catch (err: unknown) {
      const error = err as Error;
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{ animation: "pulse-slow 8s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          style={{ animation: "pulse-slow 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"
          style={{ animation: "pulse-slow 6s ease-in-out infinite 1s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌌</span>
              <div>
                <h1 className="text-xl font-bold text-white">Cosmic Astrology</h1>
                <p className="text-slate-400 text-xs font-mono hidden sm:block">
                  Base Network • On-chain Fun
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <NetworkBadge chainId={chainId} onSwitch={switchToBase} />
              {address && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <button
                    onClick={disconnect}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Error Display */}
        {(error || actionError) && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
            ⚠️ {error || actionError}
          </div>
        )}

        {/* Network Warning */}
        {address && !isCorrectNetwork && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
            <p className="text-yellow-200 text-lg font-semibold mb-3">
              ⚠️ Wrong Network Detected
            </p>
            <p className="text-yellow-300/70 mb-4">
              This dApp only works on Base mainnet. Please switch to continue.
            </p>
            <button
              onClick={switchToBase}
              className="px-6 py-3 rounded-xl font-bold bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors"
            >
              Switch to Base Network
            </button>
          </div>
        )}

        {/* Not Connected State */}
        {!address && <WalletConnect onConnect={connect} isConnecting={isConnecting} />}

        {/* Connected but wrong network */}
        {address && !isCorrectNetwork && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              Switch to Base network to interact with the dApp
            </p>
          </div>
        )}

        {/* Connected and correct network */}
        {address && isCorrectNetwork && (
          <div className="space-y-6 md:space-y-8">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="text-5xl animate-bounce mb-4">🔮</div>
                <p className="text-slate-300">Reading the stars...</p>
              </div>
            )}

            {/* No Profile - Create One */}
            {!isLoading && !profileExists && (
              <CreateProfile
                onCreate={handleCreateProfile}
                isCreating={isCreating}
              />
            )}

            {/* Has Profile - Show Dashboard */}
            {!isLoading && profileExists && profile && (
              <>
                {/* Profile Card */}
                <ProfileCard
                  profile={profile}
                  address={address}
                  onClaimFortune={handleClaimFortune}
                  isClaiming={isClaiming}
                />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Match Panel */}
                  <MatchPanel
                    onMatch={handleMatch}
                    onCheckCompatibility={getCompatibility}
                    disabled={!profileExists}
                  />

                  {/* Match History */}
                  <MatchHistory walletAddress={address} />
                </div>

                {/* Activity Feed */}
                <ActivityFeed />

                {/* Refresh Button */}
                <div className="text-center">
                  <button
                    onClick={fetchProfile}
                    className="px-6 py-3 rounded-xl font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors"
                  >
                    🔄 Refresh Profile Data
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Contract Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-xs font-mono">
            Contract:{" "}
            <a
              href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-xs">
            Requested by{" "}
            <a
              href="https://twitter.com/jianke2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              @jianke2
            </a>{" "}
            · Built by{" "}
            <a
              href="https://twitter.com/clonkbot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              @clonkbot
            </a>
          </p>
        </div>
      </footer>

      {/* Global Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
