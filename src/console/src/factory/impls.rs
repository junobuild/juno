use crate::factory::types::CanisterCreator;
use crate::factory::types::CreateSegmentArgs;
use candid::Principal;
use junobuild_shared::types::interface::{
    CreateCanisterArgs, CreateMissionControlArgs, CreateOrbiterArgs, CreateSatelliteArgs,
};
use junobuild_shared::types::state::{ControllerId, UserId};

impl CanisterCreator {
    pub fn purchaser(&self) -> &Principal {
        match self {
            CanisterCreator::User((user, _)) => user,
            CanisterCreator::MissionControl((mission_control, _)) => mission_control,
        }
    }

    pub fn account_owner(&self) -> &UserId {
        match self {
            CanisterCreator::User((user, _)) => user,
            CanisterCreator::MissionControl((_, user)) => user,
        }
    }

    pub fn controllers(&self) -> Vec<ControllerId> {
        match self {
            CanisterCreator::User((user, mission_control)) => {
                let mut controllers = Vec::from([*user]);
                controllers.extend(mission_control);
                controllers
            }
            CanisterCreator::MissionControl((mission_control, user)) => {
                Vec::from([*user, *mission_control])
            }
        }
    }
}

impl From<CreateOrbiterArgs> for CreateSegmentArgs {
    fn from(args: CreateOrbiterArgs) -> Self {
        Self {
            block_index: args.block_index,
            subnet_id: args.subnet_id,
        }
    }
}

impl From<CreateSatelliteArgs> for CreateSegmentArgs {
    fn from(args: CreateSatelliteArgs) -> Self {
        Self {
            block_index: args.block_index,
            subnet_id: args.subnet_id,
        }
    }
}

impl From<CreateMissionControlArgs> for CreateSegmentArgs {
    fn from(args: CreateMissionControlArgs) -> Self {
        Self {
            // Unlike Satellite and Orbiter, Mission Control can only be
            // spin using credits or ICRC-2 transfer from.
            block_index: None,
            subnet_id: args.subnet_id,
        }
    }
}

impl From<CreateCanisterArgs> for CreateSegmentArgs {
    fn from(args: CreateCanisterArgs) -> Self {
        Self {
            // Unlike Satellite and Orbiter, or same as Mission Control, Canister can only be
            // spin using credits or ICRC-2 transfer from.
            block_index: None,
            subnet_id: args.subnet_id,
        }
    }
}
