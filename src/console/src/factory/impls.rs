use crate::factory::types::CanisterCreator;
use candid::Principal;
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

    pub fn controllers(&self) -> &Vec<ControllerId> {
        match self {
            CanisterCreator::User(user) => &Vec::from(user),
            CanisterCreator::MissionControl((mission_control, user)) => {
                &Vec::from([*user, *mission_control])
            }
        }
    }
}
