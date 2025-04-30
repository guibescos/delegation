"use client";

import { Button } from "@/components/ui/button";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@/components/WalletButton";
import { Keypair, PublicKey, VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import delegationIdl from "../idl/delegation_demo.json"
import counterIdl from "../idl/counter.json"
import type { DelegationDemo } from "../idl/delegation_demo"
import type { Counter } from "../idl/counter"
import { Connection } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

export default function Home() {
  const { publicKey, signTransaction, signMessage } = useWallet();
  const anchorWallet = useAnchorWallet();

  const [log, setLog] = useState<string[]>([]);
  const [agent, setAgent] = useState<Keypair | null>(null);
  const handleEnableTrading = useCallback(() => {
    const inner = async () => {
      const newAgent = Keypair.generate();

      const provider = new AnchorProvider(
        new Connection("http://localhost:8899"),
        new NodeWallet(newAgent),
        {}
      )

      const delegationProgram : Program<DelegationDemo> = new Program<DelegationDemo>(
        delegationIdl as DelegationDemo,
        provider
      )


      const transaction = await delegationProgram.methods.setDelegation().accounts({
        payer: new PublicKey("GguFh5trQaECMxfdUnf124k8pV9XRbtxr9y1Xsr8LDhf"),
        delegator: new PublicKey(publicKey!.toBase58()),
        delegation: new PublicKey(newAgent!.publicKey.toBase58()),
      }).transaction();


      // setAgent(newAgent);
      const message =
      {
        "fogoChainId": "localnet",
        "agentAddress": newAgent.publicKey.toBase58(),
        "nonce": Math.floor(Date.now() / 1000),
      }

      // if (!signMessage) {
      //   setLog((log) => [...log, "Wallet not connected"]);
      //   return;
      // };

      transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer =  new PublicKey("GguFh5trQaECMxfdUnf124k8pV9XRbtxr9y1Xsr8LDhf");
      const signedTransaction = await new NodeWallet(newAgent!).signTransaction(transaction);

      // await signMessage(new Uint8Array(Buffer.from(JSON.stringify(message))));
      console.log("NEW AGENT", newAgent.publicKey.toBase58());
      setAgent(newAgent);

      await fetch('/api/fund_and_send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:  JSON.stringify([Buffer.from(signedTransaction.serialize({requireAllSignatures: false}))]),
      })

    };
    //   if (!publicKey || !signTransaction) return;
    //   setLog(["Getting quote..."]);
    //   // random to avoid same opportunity submitted recently error
    //   const amount = 1000000 + Math.floor(Math.random() * 1000);
    //   setLog((log) => [...log, `Selling ${amount / 1e6} USDT for USDC`]);
    //   const quote = await expressRelayClient.getQuote({
    //     chainId: "development-solana",
    //     inputTokenMint: USDT,
    //     outputTokenMint: USDC,
    //     referralFeeInfo: {
    //       router: publicKey,
    //       referralFeeBps: 0,
    //     },
    //     userWallet: publicKey,
    //     specifiedTokenAmount: {
    //       amount,
    //       side: "input",
    //     },
    //     minimumLifetime: 5,
    //   });

    //   setLog((log) => [
    //     ...log,
    //     JSON.stringify(
    //       {
    //         inputAmount: quote.inputToken.amount.toString(),
    //         outputAmount: quote.outputToken.amount.toString(),
    //         expirationTime: quote.expirationTime
    //           ? quote.expirationTime.toISOString()
    //           : "undefined",
    //       },
    //       null,
    //       2,
    //     ),
    //   ]);
    //   if (!quote.transaction) {
    //     throw new Error(
    //       "Transaction not found due to wallet not being connected",
    //     );
    //   }
    //   const signedTransaction = await signTransaction(quote.transaction);
    //   // Do not call getAccountKeys() in case there is an unresolved lookup table
    //   const accountPosition =
    //     signedTransaction.message.staticAccountKeys.findIndex((key) =>
    //       key.equals(publicKey),
    //     );
    //   const signature = signedTransaction.signatures[accountPosition];
    //   if (!signature) {
    //     throw new Error("Signature not found");
    //   }
    //   const tx = await expressRelayClient.submitQuote({
    //     chainId: "development-solana",
    //     referenceId: quote.referenceId,
    //     userSignature: bs58.encode(signature),
    //   });
    //   const tx_hash = tx.signatures[0];
    //   if (!tx_hash) {
    //     throw new Error("Transaction hash not found");
    //   }
    //   setLog((log) => [...log, "Submitted quote: " + bs58.encode(tx_hash)]);
    // };
    inner().catch((error) => {
      setLog((log) => [...log, error.message]);
      console.error(error);
    });
  }, [publicKey, signMessage]);

  const handleTrade = useCallback(() => {
    const inner = async () => {

      console.log("AGENT", agent!.publicKey.toBase58());
      const provider = new AnchorProvider(
        new Connection("http://localhost:8899"),
        new NodeWallet(agent!),
        {}
      )
      
    
      const counterProgram : Program<Counter> = new Program<Counter>(
        counterIdl as Counter,
        provider
      )

      const transaction = await counterProgram.methods.setCounter().accountsPartial({
        payer: new PublicKey("GguFh5trQaECMxfdUnf124k8pV9XRbtxr9y1Xsr8LDhf"),
        delegation: agent!.publicKey,
        counter: PublicKey.findProgramAddressSync(
          [publicKey!.toBuffer()],
          counterProgram.programId
        )[0]
      }).transaction();

      // counterInstruction.keys[2].isSigner = false;

      // const transaction = await delegationProgram.methods.transact(counterInstruction.data).accounts({
      //   agent: new PublicKey(agent!.publicKey.toBase58()),
      // }).remainingAccounts([{
      //   pubkey: counterProgram.programId,
      //   isWritable: false,
      //   isSigner: false
      // }, ...counterInstruction.keys]).transaction();
      
      transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer =  new PublicKey("GguFh5trQaECMxfdUnf124k8pV9XRbtxr9y1Xsr8LDhf");
      const signedTransaction = await new NodeWallet(agent!).signTransaction(transaction);

      const response = await fetch('/api/fund_and_send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([Buffer.from(signedTransaction.serialize({requireAllSignatures: false}))]),
      })
      console.log("RESPONSE", response);
    }
    inner().catch((error) => {
      setLog((log) => [...log, error.message]);
      console.error(error);
    });
  }, [agent]);

  const canSwap = publicKey && signMessage;
  return (
    <main>
      <div className="m-auto w-2/4 parent space-y-2">
        <h1>Delegation Demo</h1>
        <WalletMultiButton />
        <WalletDisconnectButton />
        {canSwap && (
          <Button onClick={handleEnableTrading}>
            Enable Trading
          </Button>
        )}
        {
          agent && (
            <Button onClick={handleTrade}>
              Trade
            </Button>
          )
        }
        <pre>
          {log.map((line: string, i: number) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
      </div>
    </main>
  );
}
