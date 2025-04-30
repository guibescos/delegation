import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import {
  Connection,
  Keypair,
  VersionedTransaction,
} from '@solana/web3.js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AnchorProvider } from '@coral-xyz/anchor'

const payer = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.FUNDER_KEY!))
  )

const solanaUrl = process.env.SOLANA_URL!;

const wallet = new NodeWallet(payer);
const provider = new AnchorProvider(
  new Connection(solanaUrl),
  wallet,
  {}
)


export default async function handlerFundTransaction(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  console.log("REQ", req.body);
  const data = req.body
  let transactions: VersionedTransaction[] = []
  let signedTransactions: VersionedTransaction[] = []

  if (data.length >= 10) {
    return res.status(400).json({
      error: 'Too many transactions',
    })
  }

  try {
    transactions = data.map((serializedTx: any) => {
      return VersionedTransaction.deserialize(new Uint8Array(Buffer.from(serializedTx)))
    })
  } catch {
    console.log("FAILED TO DESERIALIZE");
    return res.status(400).json({
      error: 'Failed to deserialize transactions',
    })
  }

  
    signedTransactions = await wallet.signAllTransactions(transactions)
    console.log("SIGNED TRANSACTIONS", signedTransactions.map((tx) => tx.signatures));
    await provider.sendAll(signedTransactions.map((tx) => ({tx})), {skipPreflight: true})

    return res.status(200).json({
        message: "Transactions sent"
      })
}
