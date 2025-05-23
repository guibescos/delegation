use anchor_lang::prelude::*;
use delegation_registry::Delegation;

declare_id!("9k76vmCCxihurhKTtgQ8unmjpm3CgZCkfr32Dpp2dmKm");

#[program]
pub mod counter {
    use super::*;
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.counter+= 1;
        ctx.accounts.counter.owner = ctx.accounts.agent.delegator;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(signer)]
    pub agent: Account<'info, Delegation>,
    #[account(init_if_needed, payer=payer, space = 8 + Counter::LEN, seeds = [agent.delegator.as_ref()], bump)]
    pub counter: Account<'info, Counter>,
    pub system_program : Program<'info, System>
}

#[account]
pub struct Counter {
    pub owner: Pubkey,
    pub counter : u64
}

impl Counter {
    pub const LEN: usize = 32 + 8;
}