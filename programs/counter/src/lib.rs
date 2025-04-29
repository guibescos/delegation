use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke_signed, secp256k1_recover};
use delegation_registry::Delegation;

declare_id!("5oCzLdFoo8qqeo5ftdLcaXpRwSAbQGppzLids5Lo512G");

pub fn check_delegate_or_delegator(owner: Pubkey, ){

}
#[program]
pub mod counter {

    use super::*;

    pub fn set_counter(ctx: Context<SetCounter>, args: SetCounterArgs) -> Result<()> {
        ctx.accounts.counter.counter = args.counter;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub owner: AccountInfo<'info>,
    #[account(init_if_needed, payer=payer, space = 16, seeds = [owner.key.as_ref()], bump)]
    pub counter: Account<'info, Counter>,
    pub delegator : Option<Signer<'info>>,
    pub delegation : Option<Account<'info, Delegation>>,
    pub system_program : Program<'info, System>
}

impl<'info> SetCounter<'info>{
    fn check_delegate_or_delegator(&self) -> bool{
        return self.owner.is_signer || self.delegator.is_some() && self.delegation.is_some() && self.delegation.clone().unwrap().delegator == *self.owner.key
    }
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct SetCounterArgs {
    pub counter : u64
}

#[account]
pub struct Counter {
    pub counter : u64
}