import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  ELEMENTS,
  BASE_CHAIN_ID,
  BASE_CHAIN_CONFIG,
} from "../contract";

export interface AstrologyProfile {
  element: string;
  level: number;
  xp: number;
  energy: number;
  luckyNumber: number;
  winStreak: number;
  lastFortuneTime: number;
  canClaimFortune: boolean;
  timeUntilFortune: number;
}

export function useContract() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<AstrologyProfile | null>(null);
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if on correct network
  const isCorrectNetwork = chainId === BASE_CHAIN_ID;

  // Switch to Base network
  const switchToBase = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_CONFIG.chainId }],
      });
    } catch (switchError: unknown) {
      // Chain doesn't exist, add it
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [BASE_CHAIN_CONFIG],
          });
        } catch {
          setError("Failed to add Base network");
        }
      }
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask or another Web3 wallet");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);

      const network = await web3Provider.getNetwork();
      setChainId(network.chainId);

      // Force switch to Base if not on it
      if (network.chainId !== BASE_CHAIN_ID) {
        await switchToBase();
        // Re-initialize provider after switch
        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
        const newNetwork = await newProvider.getNetwork();

        if (newNetwork.chainId !== BASE_CHAIN_ID) {
          setError("Please switch to Base network to continue");
          setIsConnecting(false);
          return;
        }

        setProvider(newProvider);
        setChainId(newNetwork.chainId);
        const newSigner = newProvider.getSigner();
        setSigner(newSigner);
        const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
        setContract(newContract);
        const addr = await newSigner.getAddress();
        setAddress(addr);
      } else {
        setProvider(web3Provider);
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
        setContract(web3Contract);
        const addr = await web3Signer.getAddress();
        setAddress(addr);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [switchToBase]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAddress(null);
    setChainId(null);
    setProfile(null);
    setProfileExists(false);
  }, []);

  // Check if profile exists
  const checkProfileExists = useCallback(async () => {
    if (!contract || !address) return false;

    try {
      const exists = await contract.profileExists(address);
      setProfileExists(exists);
      return exists;
    } catch {
      return false;
    }
  }, [contract, address]);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const exists = await contract.profileExists(address);
      setProfileExists(exists);

      if (exists) {
        const data = await contract.getProfile(address);
        const lastFortune = data.lastFortuneTime.toNumber() * 1000;
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        const timeUntil = Math.max(0, lastFortune + cooldown - now);

        setProfile({
          element: ELEMENTS[data.element] || "Unknown",
          level: data.level,
          xp: data.xp.toNumber(),
          energy: data.energy.toNumber(),
          luckyNumber: data.luckyNumber.toNumber(),
          winStreak: data.winStreak.toNumber(),
          lastFortuneTime: lastFortune,
          canClaimFortune: timeUntil === 0,
          timeUntilFortune: timeUntil,
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  // Create profile
  const createProfile = useCallback(async () => {
    if (!contract) throw new Error("Contract not initialized");

    const exists = await checkProfileExists();
    if (exists) {
      throw new Error("Profile already exists");
    }

    const tx = await contract.createProfile({ value: 0 });
    await tx.wait();
    await fetchProfile();
  }, [contract, checkProfileExists, fetchProfile]);

  // Claim daily fortune
  const claimFortune = useCallback(async () => {
    if (!contract) throw new Error("Contract not initialized");

    const tx = await contract.claimDailyFortune({ value: 0 });
    await tx.wait();
    await fetchProfile();
  }, [contract, fetchProfile]);

  // Match with another address
  const matchWith = useCallback(
    async (otherAddress: string) => {
      if (!contract) throw new Error("Contract not initialized");

      // Get compatibility first (view function)
      const compatibility = await contract.getCompatibility(address, otherAddress);

      // Then call the match function
      const tx = await contract.matchWith(otherAddress, { value: 0 });
      await tx.wait();
      await fetchProfile();

      return compatibility.toNumber();
    },
    [contract, address, fetchProfile]
  );

  // Get compatibility (view only)
  const getCompatibility = useCallback(
    async (otherAddress: string): Promise<number> => {
      if (!contract || !address) throw new Error("Contract not initialized");

      const compatibility = await contract.getCompatibility(address, otherAddress);
      return compatibility.toNumber();
    },
    [contract, address]
  );

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const eth = window.ethereum;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);

      if (newChainId !== BASE_CHAIN_ID) {
        setError("Please switch to Base network");
      } else {
        setError(null);
      }
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, [address, disconnect]);

  // Auto-fetch profile when connected
  useEffect(() => {
    if (contract && address && isCorrectNetwork) {
      fetchProfile();
    }
  }, [contract, address, isCorrectNetwork, fetchProfile]);

  return {
    // State
    address,
    chainId,
    isConnecting,
    isLoading,
    error,
    profile,
    profileExists,
    isCorrectNetwork,

    // Actions
    connect,
    disconnect,
    switchToBase,
    createProfile,
    claimFortune,
    matchWith,
    getCompatibility,
    fetchProfile,
    checkProfileExists,
  };
}

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
