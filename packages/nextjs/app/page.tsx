"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { hexToString } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const API_BASE_URL = "http://localhost:3001"; // Adjust as per your backend setup

const TokenAddressFromApi = () => {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/contract-address`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p className="text-gray-500">Loading token address from API...</p>;
  if (!data) return <p className="text-red-500">No token address information</p>;

  return <p className="text-green-600">Token address from API: {data.result}</p>;
};

const TokenName = () => {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/token-name`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p className="text-gray-500">Loading token name...</p>;
  if (!data) return <p className="text-red-500">No token name information</p>;

  return <p className="text-blue-600">Token name: {data.result}</p>;
};

const TotalSupply = () => {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/total-supply`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p className="text-gray-500">Loading total supply...</p>;
  if (!data) return <p className="text-red-500">No total supply information</p>;

  return <p className="">Total supply: {data.result}</p>;
};

const MintTokensForm = () => {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/mint-tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, amount }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      setResponse(result.result);
    } catch (err) {
      setError(err.message || "Failed to mint tokens");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-gray-700 mb-4">Mint Tokens</h2>
      <form onSubmit={handleMintTokens} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Address:</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            min={1}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? "Minting Tokens..." : "Mint Tokens"}
        </button>
      </form>
      {response && <p className="text-green-600 mt-4">Success: {response}</p>}
      {error && <p className="text-red-500 mt-4">Error: {error}</p>}
    </div>
  );
};

const Winner = () => {
  const { data: winnerName } = useScaffoldReadContract({
    contractName: "Ballot",
    functionName: "winnerName",
  });

  if (!winnerName) return <p className="text-gray-500">Fetching winner...</p>;

  return <p className="text-green-600">Winning Proposal: {hexToString(winnerName).replace(/\0+$/, "")}</p>;
};
const DelegateComponent = () => {
  const [address, setAddress] = useState<string>(""); // Address to delegate to
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/delegate?address=${address}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data.result);
    } catch (err: any) {
      setError(err.message || "Failed to delegate voting power");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg space-y-4">
      <h2 className="text-lg font-bold text-gray-700">Delegate Voting Power</h2>
      <form onSubmit={handleDelegate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Delegate To Address:</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            placeholder="Enter address"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? "Delegating..." : "Delegate"}
        </button>
      </form>
      {response && <p className="text-green-600">Delegation Successful: {response}</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  );
};
const RemainingVotingPower = () => {
  const { address, isConnected } = useAccount();

  const [remainingVotePower, setRemainingVotePower] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemainingVotePower = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/token-balance/${address}`);
        const data = await response.json();
        setRemainingVotePower(data.result);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching remaining vote power:", error);
        setLoading(false);
      }
    };

    if (isConnected) {
      fetchRemainingVotePower();
    }
  }, [isConnected]);

  if (isLoading) return <p className="text-gray-500">Fetching remaining vote power...</p>;
  if (!remainingVotePower) return <p className="text-red-500">Error fetching remaining vote power</p>;

  return <p className=" text-2xl text-center">Remaining Vote Power: {remainingVotePower}</p>;
};

const Voting = () => {
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("Ballot");

  const voteForProposal = async (proposalIndex: number) => {
    try {
      await writeYourContractAsync({
        functionName: "vote",
        args: [BigInt(proposalIndex), BigInt(1 * 10 ** 18)],
      });
      console.log(`Successfully voted for proposal ${proposalIndex}`);
    } catch (e) {
      console.error(`Error voting for proposal ${proposalIndex}:`, e);
    }
  };

  return (
    <div className="space-y-4 mt-5 flex flex-col justify-center items-center">
      <h2 className="text-lg font-bold ">Vote for a Proposal</h2>
      <button className="btn btn-primary" onClick={() => voteForProposal(0)}>
        Vote for Proposal 0
      </button>
      <button className="btn btn-primary" onClick={() => voteForProposal(1)}>
        Vote for Proposal 1
      </button>
      <button className="btn btn-primary" onClick={() => voteForProposal(2)}>
        Vote for Proposal 2
      </button>
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Voting dApp Dashboard</h1>
      <div className="space-y-4">
        <TokenAddressFromApi />
        <TokenName />
        <TotalSupply />
        <Winner />
      </div>
      <div className="mt-6">
        <MintTokensForm />
        <RemainingVotingPower />
        <DelegateComponent />
        <Voting />
      </div>
    </div>
  );
};

export default Home;
