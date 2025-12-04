use junobuild_shared::types::state::{MissionControlId, UserId};

#[derive(Clone)]
pub enum CanisterCreator {
    User(UserId), // The caller is the owner of the account. The caller comes from the Console UI.
    MissionControl((MissionControlId, UserId)), // The caller is a mission control
}
