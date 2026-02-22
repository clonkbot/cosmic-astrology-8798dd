import { BASE_CHAIN_ID } from "../contract";

interface NetworkBadgeProps {
  chainId: number | null;
  onSwitch: () => void;
}

export function NetworkBadge({ chainId, onSwitch }: NetworkBadgeProps) {
  const isBase = chainId === BASE_CHAIN_ID;

  const networkName = chainId
    ? chainId === BASE_CHAIN_ID
      ? "Base"
      : chainId === 1
        ? "Ethereum"
        : chainId === 195
          ? "xLayer"
          : `Chain ${chainId}`
    : "Not Connected";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2
          ${isBase ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}
        `}
      >
        <span
          className={`w-2 h-2 rounded-full ${isBase ? "bg-blue-400 animate-pulse" : "bg-red-400"}`}
        />
        {networkName}
      </div>
      {!isBase && chainId && (
        <button
          onClick={onSwitch}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
        >
          Switch to Base
        </button>
      )}
    </div>
  );
}
