use crate::factory::types::CanisterCreator;
use crate::factory::types::CreateCanisterArgs;
use candid::Principal;
use junobuild_shared::types::interface::{
    CreateMissionControlArgs, CreateOrbiterArgs, CreateSatelliteArgs,
};
use junobuild_shared::types::state::{ControllerId, UserId};

impl CanisterCreator {
    pub fn purchaser(&self) -> &Principal {
        match self {
            CanisterCreator::User(user) => user,
            CanisterCreator::MissionControl((mission_control, _)) => mission_control,
        }
    }

    pub fn account_owner(&self) -> &UserId {
        match self {
            CanisterCreator::User(user) => user,
            CanisterCreator::MissionControl((_, user)) => user,
        }
    }

    pub fn controllers(&self) -> Vec<ControllerId> {
        match self {
            CanisterCreator::User(user) => Vec::from([*user]),
            CanisterCreator::MissionControl((mission_control, user)) => {
                Vec::from([*user, *mission_control])
            }
        }
    }
}

impl From<CreateOrbiterArgs> for CreateCanisterArgs {
    fn from(args: CreateOrbiterArgs) -> Self {
        Self {
            block_index: args.block_index,
            subnet_id: args.subnet_id,
        }
    }
}

impl From<CreateSatelliteArgs> for CreateCanisterArgs {
    fn from(args: CreateSatelliteArgs) -> Self {
        Self {
            block_index: args.block_index,
            subnet_id: args.subnet_id,
        }
    }
}

impl From<CreateMissionControlArgs> for CreateCanisterArgs {
    fn from(args: CreateMissionControlArgs) -> Self {
        Self {
            // Unlike Satellite and Orbiter, Mission Control can only be
            // spin using credits or ICRC-2 transfer from.
            block_index: None,
            subnet_id: args.subnet_id,
        }
    }
}
