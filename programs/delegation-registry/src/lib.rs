use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke_signed, secp256k1_recover};

declare_id!("5QdNueoih49C6pmYCaUvX5TN2Sar47FQkGXKMpt5HmHg");

#[program]
pub mod delegation_demo {

    use super::*;

    pub fn set_delegation(ctx: Context<SetDelegation>) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        delegation.delegator = ctx.accounts.delegator.key();
        Ok(())
    }

    pub fn transact(ctx: Context<Transact>, data: Vec<u8>) -> Result<()> {
        let (executor_key, bump) = Pubkey::find_program_address(&[ctx.accounts.delegation.delegator.as_ref()], &ID);

        let instruction = Instruction {
            program_id: *ctx.remaining_accounts[0].key,
            accounts: ctx.remaining_accounts[1..].iter().map(|a| a.to_account_metas(Some(a.is_signer || a.key() == executor_key))).flatten().collect(),
            data,
        };

        invoke_signed(
            &instruction,
            ctx.remaining_accounts,
            &[&[
                ctx.accounts.delegation.delegator.as_ref(),
                &[bump],
            ]],
        )?;

        msg!("Transacted");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetDelegation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK:
    pub delegator: AccountInfo<'info>,
    #[account(init, payer = payer, space = 8 +Delegation::LEN)]
    pub delegation: Account<'info, Delegation>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Transact<'info> {
    pub agent: Signer<'info>,
    #[account(seeds = [agent.key().as_ref()], bump)]
    pub delegation: Account<'info, Delegation>,
}


#[account]
pub struct Delegation {
    pub delegator: Pubkey,
}

impl Delegation {
    pub const LEN: usize = 32;
}

// #[derive(AnchorSerialize, AnchorDeserialize)]
// pub struct SetDelegationArgs {
//     pub deadline: i64,
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