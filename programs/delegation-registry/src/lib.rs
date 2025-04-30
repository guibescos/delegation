use anchor_lang::prelude::*;

declare_id!("5QdNueoih49C6pmYCaUvX5TN2Sar47FQkGXKMpt5HmHg");

#[program]
pub mod delegation_registry {
    use super::*;

    pub fn set_delegation(ctx: Context<SetDelegation>) -> Result<()> {
        ctx.accounts.agent.delegator = ctx.accounts.delegator.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetDelegation<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: TODO check this guy has signed an intent
    pub delegator: AccountInfo<'info>,
    #[account(init, payer = payer, space = 8 + Delegation::LEN)]
    pub agent: Account<'info, Delegation>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Delegation {
    pub delegator: Pubkey,
}

impl Delegation {
    pub const LEN: usize = 32;
}