use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke_signed, secp256k1_recover};

declare_id!("5QdNueoih49C6pmYCaUvX5TN2Sar47FQkGXKMpt5HmHg");

#[program]
pub mod delegation_demo {

    use super::*;

    pub fn set_delegation(ctx: Context<SetDelegation>, args: SetDelegationArgs) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        delegation.delegator = ctx.accounts.delegator.key();
        delegation.deadline = args.deadline;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetDelegation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub delegate: Signer<'info>,
    pub delegator: Signer<'info>,
    #[account(init_if_needed,
        payer = payer,
        space = 8 + Delegation::LEN,
        seeds = [delegate.key().as_ref()],
        bump,
    )]
    pub delegation: Account<'info, Delegation>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Delegation {
    pub delegator: Pubkey,
    pub deadline: i64,
}

impl Delegation {
    pub const LEN: usize = 40;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SetDelegationArgs {
    pub deadline: i64,
}

// #[derive(Accounts)]
// pub struct Transact<'info> {
//     pub delegate: Signer<'info>,
//     #[account(seeds = [b"delegation", delegate.key().as_ref()], bump)]
//     pub delegation: Account<'info, Delegation>,
//     pub program_id: AccountInfo<'info>,
// }


//     pub fn transact(ctx: Context<Transact>, data: Vec<u8>) -> Result<()> {
//         let instruction = Instruction {
//             program_id: *ctx.program_id,
//             accounts: ctx.remaining_accounts.iter().map(|a| a.to_account_metas(Some(a.is_signer))).flatten().collect(),
//             data,
//         };

//         invoke_signed(
//             &instruction,
//             ctx.remaining_accounts,
//             &[&[
//                 b"delegation",
//                 ctx.accounts.delegate.key().as_ref(),
//                 &[ctx.bumps.delegation],
//             ]],
//         )?;

//         let signature = secp256k1_recover(hash, recovery_id, signature);

//         Ok(())
//     }
// }