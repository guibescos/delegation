use anchor_lang::prelude::*;
use delegation_registry::Delegation;

declare_id!("5oCzLdFoo8qqeo5ftdLcaXpRwSAbQGppzLids5Lo512G");

#[program]
pub mod counter {

    use super::*;

    pub fn set_counter(ctx: Context<SetCounter>) -> Result<()> {
        ctx.accounts.counter.counter+= 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(signer)]
    pub delegation: Account<'info, Delegation>,
    #[account(init_if_needed, payer=payer, space = 16, seeds = [delegation.delegator.as_ref()], bump)]
    pub counter: Account<'info, Counter>,
    pub system_program : Program<'info, System>
}

#[account]
pub struct Counter {
    pub counter : u64
}