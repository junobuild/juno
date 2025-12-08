use crate::factory::types::CreateCanisterArgs;
use junobuild_shared::types::interface::{CreateOrbiterArgs, CreateSatelliteArgs};

impl From<CreateOrbiterArgs> for CreateCanisterArgs {
    fn from(args: CreateOrbiterArgs) -> Self {
        Self {
            user: args.user,
            block_index: args.block_index,
            subnet_id: args.subnet_id,
        }
    }
}

impl From<CreateSatelliteArgs> for CreateCanisterArgs {
    fn from(args: CreateSatelliteArgs) -> Self {
        Self {
            user: args.user,
            block_index: args.block_index,
            subnet_id: args.subnet_id,
        }
    }
}
