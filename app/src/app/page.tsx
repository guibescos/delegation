"use client";

import { Button } from "@/components/ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@/components/WalletButton";
import { Keypair, PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
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
    })).sort((a, b) => b.value - a.value));
    
  }, []);

  useEffect(() => {
    fetchAllAccounts();
  }, [fetchAllAccounts]);

  useEffect(() => {
    setCounter(null);
    setAgent(null);
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      let userIndex = leaderBoardData.findIndex((account) => account.owner === publicKey.toBase58());
      if (userIndex === -1) {
        setLeaderboardData([...leaderBoardData, {owner: publicKey.toBase58(), value: counter ? counter : 0}]);
      } else {
        setLeaderboardData([...leaderBoardData.slice(0, userIndex), {owner: publicKey.toBase58(), value: counter ? counter : leaderBoardData[userIndex]!.value}, ...leaderBoardData.slice(userIndex + 1)]);
      }
    }
  }, [counter, publicKey]);

  const refreshCounter = useCallback(async () => {
    console.log("refreshing counter for ", publicKey?.toBase58());
    const counter = await counterProgram.account.counter.fetchNullable(getCounterAddress(publicKey!));
    setCounter(counter? counter.counter.toNumber() : 0);
  }, [publicKey]);

  const handleEnableTrading = useCallback(() => {
    const inner = async () => {
      const newAgent = Keypair.generate();
      setAgent(newAgent);

      const transaction = await delegationProgram.methods.setDelegation().accounts({
        payer: payer,
        delegator: publicKey!,
        agent: newAgent.publicKey,
      }).transaction();


      const message = {
        "fogoChainId": "localnet",
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

    };
    inner().catch((error) => {
      console.error(error);
    });
  }, [publicKey, signMessage]);

  const handleTrade = useCallback(() => {
    const inner = async () => {
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

      await fetch('/api/fund_and_send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Buffer.from(signedTransaction.serialize({requireAllSignatures: false}))),
      })
      await refreshCounter();
    }
    inner().catch((error) => {
      console.error(error);
    });
  }, [agent]);

  const canEnableTrading = publicKey && signMessage;
  const canTrade = agent && publicKey;
  return (
    <main>
      <div className="m-auto w-2/4 parent space-y-2">
        <h1>UX Demo</h1>
        <WalletMultiButton />
        <WalletDisconnectButton />
        {canEnableTrading && !canTrade && (
          <Button onClick={handleEnableTrading}>
            Enable Trading
          </Button>
        )}
        {
          canTrade && (
            <Button onClick={handleTrade}>
              Trade
            </Button>
          )
        }
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
