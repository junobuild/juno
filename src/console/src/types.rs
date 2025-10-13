pub mod state {
    use crate::memory::manager::init_stable_state;
    use crate::types::ledger::Payment;
    use candid::CandidType;
    use ic_ledger_types::{BlockIndex, Tokens};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_auth::types::state::AuthenticationHeapState;
    use junobuild_cdn::proposals::{ProposalsStable, SegmentDeploymentVersion};
    use junobuild_cdn::storage::{ProposalAssetsStable, ProposalContentChunksStable};
    use junobuild_shared::rate::types::{RateConfig, RateTokens};
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Controllers, Timestamp};
    use junobuild_shared::types::state::{MissionControlId, UserId};
    use junobuild_storage::types::state::StorageHeapState;
    use serde::{Deserialize, Serialize};
    use std::collections::{HashMap, HashSet};

    pub type MissionControls = HashMap<UserId, MissionControl>;
    pub type Payments = HashMap<BlockIndex, Payment>;
    pub type InvitationCodes = HashMap<InvitationCode, InvitationCodeRedeem>;

    pub type MissionControlsStable = StableBTreeMap<UserId, MissionControl, Memory>;
    pub type PaymentsStable = StableBTreeMap<BlockIndex, Payment, Memory>;

    #[derive(Serialize, Deserialize)]
    pub struct State {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: HeapState,
    }

    pub struct StableState {
        pub mission_controls: MissionControlsStable,
        pub payments: PaymentsStable,
        pub proposals_assets: ProposalAssetsStable,
        pub proposals_content_chunks: ProposalContentChunksStable,
        pub proposals: ProposalsStable,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub mission_controls: MissionControls,
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub payments: Payments,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: Rates,
        pub fees: Fees,
        pub storage: StorageHeapState,
        pub authentication: Option<AuthenticationHeapState>,
        pub releases_metadata: ReleasesMetadata,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct MissionControl {
        pub mission_control_id: Option<MissionControlId>,
        pub owner: UserId,
        pub credits: Tokens,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    pub type ReleaseVersion = SegmentDeploymentVersion;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct ReleasesMetadata {
        pub mission_controls: HashSet<ReleaseVersion>,
        pub satellites: HashSet<ReleaseVersion>,
        pub orbiters: HashSet<ReleaseVersion>,
    }

    pub type InvitationCode = String;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct InvitationCodeRedeem {
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub redeemed: bool,
        pub user_id: Option<UserId>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Rate {
        pub tokens: RateTokens,
        pub config: RateConfig,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Rates {
        pub mission_controls: Rate,
        pub satellites: Rate,
        pub orbiters: Rate,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Fee {
        pub fee: Tokens,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Fees {
        pub satellite: Fee,
        pub orbiter: Fee,
    }
}

pub mod interface {
    use candid::CandidType;
    use junobuild_auth::types::config::AuthenticationConfig;
    use junobuild_cdn::proposals::ProposalId;
    use junobuild_storage::types::config::StorageConfig;
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Deserialize)]
    pub struct Config {
        pub storage: StorageConfig,
        pub authentication: Option<AuthenticationConfig>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct DeleteProposalAssets {
        pub proposal_ids: Vec<ProposalId>,
    }
}

pub mod ledger {
    use candid::CandidType;
    use ic_ledger_types::BlockIndex;
    use junobuild_shared::types::state::{MissionControlId, Timestamp};
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Payment {
        pub mission_control_id: Option<MissionControlId>,
        pub block_index_payment: BlockIndex,
        pub block_index_refunded: Option<BlockIndex>,
        pub status: PaymentStatus,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum PaymentStatus {
        Acknowledged,
        Completed,
        Refunded,
    }
}
