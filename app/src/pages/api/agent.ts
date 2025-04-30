import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import type { NextApiRequest, NextApiResponse } from "next"
import idl from "../../idl/delegation_demo.json"
import type { DelegationDemo } from "../../idl/delegation_demo"
import { AnchorProvider, Program } from "@coral-xyz/anchor"
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet"

const payer = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.FUNDER_KEY!))
  )

const solanaUrl = process.env.SOLANA_URL!;

const program : Program<DelegationDemo> = new Program(
  idl as DelegationDemo,
  new AnchorProvider(
      new Connection(solanaUrl),
      new NodeWallet(payer),
      {}
  ),
)
  
  export default async function handlerAgent(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method !== 'POST') {
      return res.status(405).end()
    }

    const {agentAddress, ownerAddress} = req.body
    program.methods.setDelegation().accounts({
        agent: new PublicKey(agentAddress),
        delegator: new PublicKey(ownerAddress),
    }).rpc()

  return res.status(200).json({
    message: "Delegation set"
  })
  }
  