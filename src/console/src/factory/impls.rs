use candid::Principal;
use junobuild_shared::types::state::UserId;
use crate::factory::types::CanisterCreator;

impl CanisterCreator {

    pub fn buyer(&self) -> &Principal {
        match self {
            CanisterCreator::User(caller) => caller,
            CanisterCreator::MissionControl((mission_control, _)) => mission_control,
        }
    }

    pub fn account_owner(&self) -> &UserId {
        match self {
            CanisterCreator::User(caller) => caller,
            CanisterCreator::MissionControl((_, user)) => user
        }
    }

}