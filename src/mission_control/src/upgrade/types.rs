///
/// Upgrade structure:
///
/// v0.0.2 -> v0.0.3
///
pub mod upgrade {
    use crate::types::state::{Satellites, User};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::UserId;
    use std::collections::HashSet;

    pub type UpgradeControllers = HashSet<UserId>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: UpgradeControllers,
    }
}
