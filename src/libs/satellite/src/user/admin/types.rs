pub mod state {
    use junobuild_shared::types::state::UserId;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    pub struct UserAdminKey {
        pub user_id: UserId,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    pub struct UserAdminData {
        pub banned: Option<BannedReason>,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum BannedReason {
        Indefinite,
    }
}
