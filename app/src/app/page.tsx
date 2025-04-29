"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@/components/WalletButton";
import { Keypair } from "@solana/web3.js";
import { useCallback, useState } from "react";

export default function Home() {
  const { publicKey, signTransaction, signMessage } = useWallet();

  const [log, setLog] = useState<string[]>([]);

  const handleClick = useCallback(() => {
    const inner = async () => {
      const newAgent = Keypair.generate();
      // setAgent(newAgent);
      const message =
      {
        "fogoChainId": "localnet",
        "agentAddress": newAgent.publicKey.toBase58(),
        "nonce": Math.floor(Date.now() / 1000),
      }

      if (!signMessage) {
        setLog((log) => [...log, "Wallet not connected"]);
        return;
      };

      await signMessage(new Uint8Array(Buffer.from(JSON.stringify(message))));
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
  }, []);

  const canSwap = publicKey && signTransaction;
  return (
    <main>
      <div className="m-auto w-2/4 parent space-y-2">
        <h1>Delegation Demo</h1>
        <WalletMultiButton />
        <WalletDisconnectButton />
        {canSwap && (
          <Button onClick={handleClick}>
            Enable Trading
          </Button>
        )}
        <pre>
          {log.map((line: string, i: number) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
      </div>
    </main>
  );
}
