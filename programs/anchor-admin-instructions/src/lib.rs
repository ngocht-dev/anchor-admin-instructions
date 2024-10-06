use anchor_lang::prelude::*;

declare_id!("6uNEGPZ4ocrDeCseD5qDTfFnyUGPSX8B4nAWy7z6BQwb");

#[program]
pub mod anchor_admin_instructions {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
