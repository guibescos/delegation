use anchor_lang::prelude::*;

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
    /// CHECK: this is fine 
    pub owner: AccountInfo<'info>,
    #[account(constraint = owner.key() == agent_or_owner.key() || agent_or_owner.key() == Pubkey::find_program_address(&[&owner.key().to_bytes()], &delegation_registry::ID).0)]
    pub agent_or_owner: Signer<'info>,
    #[account(init_if_needed, payer=payer, space = 16, seeds = [owner.key.as_ref()], bump)]
    pub counter: Account<'info, Counter>,
    pub system_program : Program<'info, System>
}

#[account]
pub struct Counter {
    pub counter : u64
}