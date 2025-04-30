import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import {
  Connection,
  Keypair,
  VersionedTransaction,
} from '@solana/web3.js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AnchorProvider } from '@coral-xyz/anchor'
import { FUNDER_KEY, SOLANA_RPC } from '@/config/server'

const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(FUNDER_KEY))
)
const wallet = new NodeWallet(payer);
const provider = new AnchorProvider(
  new Connection(SOLANA_RPC),
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

  const data = req.body

  let transaction: VersionedTransaction;
  try {
    transaction =
      VersionedTransaction.deserialize(new Uint8Array(Buffer.from(data)))
  } catch {
    return res.status(400).json({
      error: 'Failed to deserialize transactions',
    })
  }

  const signedTransaction = await wallet.signTransaction(transaction)
  await provider.sendAll([{ tx: signedTransaction }], { skipPreflight: true })

  return res.status(200).json({
    message: "Transactions sent"
  })
}
