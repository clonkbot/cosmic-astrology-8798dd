// Contract ABI for the Astrology dApp
export const CONTRACT_ADDRESS = "0x374531294780aB871568Ebc8a3606c80D62cdc5e";

export const CONTRACT_ABI = [
  // View functions
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getProfile",
    outputs: [
      { internalType: "uint8", name: "element", type: "uint8" },
      { internalType: "uint8", name: "level", type: "uint8" },
      { internalType: "uint256", name: "xp", type: "uint256" },
      { internalType: "uint256", name: "energy", type: "uint256" },
      { internalType: "uint256", name: "luckyNumber", type: "uint256" },
      { internalType: "uint256", name: "winStreak", type: "uint256" },
      { internalType: "uint256", name: "lastFortuneTime", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "profileExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user1", type: "address" },
      { internalType: "address", name: "user2", type: "address" },
    ],
    name: "getCompatibility",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimDailyFortune",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "other", type: "address" }],
    name: "matchWith",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const ELEMENTS = ["Fire", "Water", "Air", "Earth"] as const;

export const ELEMENT_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  Fire: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    gradient: "from-orange-500 to-red-600",
  },
  Water: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    gradient: "from-blue-500 to-cyan-600",
  },
  Air: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    gradient: "from-purple-500 to-pink-600",
  },
  Earth: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    gradient: "from-green-500 to-emerald-600",
  },
};

export const ELEMENT_EMOJIS: Record<string, string> = {
  Fire: "🔥",
  Water: "💧",
  Air: "💨",
  Earth: "🌍",
};

export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_CONFIG = {
  chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
  chainName: "Base",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};
