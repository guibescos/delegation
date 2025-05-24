"use client";

import { Button } from "@/components/ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@/components/WalletButton";
import { Keypair, PublicKey } from "@solana/web3.js";
import { useCallback, useRef, useState } from "react";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import delegationIdl from "../idl/delegation_registry.json"
import counterIdl from "../idl/counter.json"
import type { DelegationRegistry } from "../idl/delegation_registry"
import type { Counter } from "../idl/counter"
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useEffect } from "react";

const payer = process.env.NEXT_PUBLIC_FUNDER_KEY ? new PublicKey(process.env.NEXT_PUBLIC_FUNDER_KEY) : new PublicKey("GguFh5trQaECMxfdUnf124k8pV9XRbtxr9y1Xsr8LDhf");

function getCounterAddress(owner : PublicKey){
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer()],
    new PublicKey(counterIdl.address)
  )[0]
}

export default function Home() {
  const { connection } = useConnection();
  const [agent, setAgent] = useState<Keypair | null>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [leaderBoardData, setLeaderboardData] = useState<{owner: string, value: number}[]>([]);
  const [lastTradeLatency, setLastTradeLatency] = useState<number | null>(null);
  const nextResolve = useRef<(() => void) | null>(null);
  const nextPromise = useRef<Promise<void> | null>(null);
  const [loading, setLoading] = useState(false);
  const provider = new AnchorProvider(
    connection,
    {} as Wallet,
    {commitment: "processed"}
  )

  const counterProgram : Program<Counter> = new Program<Counter>(
    counterIdl as Counter,
    provider
  )

  const delegationProgram : Program<DelegationRegistry> = new Program<DelegationRegistry>(
    delegationIdl as DelegationRegistry,
    provider,
  )

  const { publicKey, signMessage } = useWallet();

  const fetchAllAccounts = useCallback(async () => {
    if (!connection) return;
    const counterAccounts = await counterProgram.account.counter.all();

    setLeaderboardData(counterAccounts.map((counter) => ({
      owner: counter.account.owner.toBase58(),
      value: counter.account.counter.toNumber(),
    })));
    
  }, [connection]);



  useEffect(() => {
    fetchAllAccounts();
  }, [fetchAllAccounts]);

  useEffect(() => {
    setCounter(null);
    setAgent(null);
    setLastTradeLatency(null);

    if (publicKey) {
      nextPromise.current = new Promise<void>((resolve) => {
        nextResolve.current = resolve; 
      });
      const subscriptionId = connection.onAccountChange(getCounterAddress(publicKey), () => {
        if (nextResolve.current) {
          nextResolve.current();
        }
        nextPromise.current = new Promise<void>((resolve) => {
          nextResolve.current = resolve;
        });
      }, "processed");
      return () => {
          connection.removeAccountChangeListener(subscriptionId);
        
      }
    }
    return () => {};
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      const userIndex = leaderBoardData.findIndex((account) => account.owner === publicKey.toBase58());
      if (userIndex === -1) {
        setLeaderboardData([...leaderBoardData, {owner: publicKey.toBase58(), value: counter ? counter : 0}]);
      } else {
        setLeaderboardData([...leaderBoardData.slice(0, userIndex), {owner: publicKey.toBase58(), value: counter ? counter : leaderBoardData[userIndex]!.value}, ...leaderBoardData.slice(userIndex + 1)]);
      }
    }
  }, [counter, publicKey]);

  const refreshCounter = useCallback(async () => {
    const counter = await counterProgram.account.counter.fetchNullable(getCounterAddress(publicKey!));
    setCounter(counter? counter.counter.toNumber() : 0);
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      const agent = localStorage.getItem(`agent-${publicKey.toBase58()}`);
      if (agent) {
        setAgent(Keypair.fromSecretKey(Uint8Array.from(JSON.parse(agent))));
      }
    }
  }, [publicKey]);

  const handleEnableTrading = useCallback(() => {
    const inner = async () => {
      setLoading(true);
      const newAgent = Keypair.generate();

      const transaction = await delegationProgram.methods.setDelegation().accounts({
        payer: payer,
        delegator: publicKey!,
        agent: newAgent.publicKey,
      }).transaction();


      const message = {
        "chaindId": process.env.NEXT_PUBLIC_CHAIN_ID,
        "agentAddress": newAgent.publicKey.toBase58(),
        "nonce": Math.floor(Date.now() / 1000),
      }
      await signMessage!(new TextEncoder().encode(JSON.stringify(message)));

      transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer =  payer;
      const signedTransaction = await new NodeWallet(newAgent).signTransaction(transaction);

      await fetch('/api/fund_and_send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:  JSON.stringify(Buffer.from(signedTransaction.serialize({requireAllSignatures: false}))),
      })
      setAgent(newAgent);
      localStorage.setItem(`agent-${publicKey!.toBase58()}`, JSON.stringify(Array.from(newAgent.secretKey)));
      setLoading(false)
    };

    inner().catch((error) => {
      setLoading(false);
      console.error(error);
    });
  }, [publicKey, signMessage]);

  const handleTrade = useCallback(() => {
    const inner = async () => {
      setLoading(true);
      const transaction = await counterProgram.methods.increment().accountsPartial({
        payer: payer,
        agent: agent!.publicKey,
        counter: PublicKey.findProgramAddressSync(
          [publicKey!.toBuffer()],
          counterProgram.programId
        )[0]
      }).transaction();

      transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer =  payer;
      const signedTransaction = await new NodeWallet(agent!).signTransaction(transaction);
      

      const time = Date.now();
      fetch('/api/fund_and_send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Buffer.from(signedTransaction.serialize({requireAllSignatures: false}))),
      })
      await nextPromise.current;

      setLastTradeLatency(Date.now() - time);
      await refreshCounter();
      setLoading(false);
    }
    inner().catch((error) => {
      setLoading(false);
      console.error(error);
    });
  }, [agent]);

  const handleDisableTrading = useCallback(() => {
    const inner = async () => {
      localStorage.removeItem(`agent-${publicKey!.toBase58()}`);
      setAgent(null);
    }
    inner().catch((error) => {
      console.error(error);
    });
  }, [publicKey]);

  const canEnableTrading = publicKey && signMessage;
  const canTrade = agent && publicKey;
  return (
    <main>
      <div className="m-auto w-2/4 parent space-y-2">
        <h1>UX Demo</h1>
        <WalletMultiButton />
        <WalletDisconnectButton />
        {canEnableTrading && !canTrade && (
          <Button onClick={handleEnableTrading} loading={loading}>
            Enable Trading
          </Button>
        )}
        {
          canTrade && (
            <Button onClick={handleTrade} loading={loading}>
              Trade
            </Button>
          )
        }
        { canTrade && (
          <Button onClick={handleDisableTrading}>
            Disable Trading
          </Button>
        )}
        {canTrade && lastTradeLatency && (
          <p>Last trade latency: {lastTradeLatency}ms</p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Number of Trades</TableHead>
            </TableRow>
            {leaderBoardData.sort((a, b) => b.value - a.value).map((account) => (
              <TableRow key={account.owner} className={publicKey && account.owner === publicKey.toBase58() ? "font-bold" : ""}>
                <TableCell>{account.owner} {publicKey && account.owner === publicKey.toBase58() ? " (you)" : ""}</TableCell>
                <TableCell>{account.value}</TableCell>
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>
    </main>
  );
}
