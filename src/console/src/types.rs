pub mod state {
    use crate::memory::manager::init_stable_state;
    use crate::types::ledger::{IcpPayment, IcrcPayment, IcrcPaymentKey};
    use candid::CandidType;
    use ic_ledger_types::{BlockIndex, Tokens};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_auth::openid::types::provider::OpenIdProvider;
    use junobuild_auth::state::types::state::AuthenticationHeapState;
    use junobuild_cdn::proposals::{ProposalsStable, SegmentDeploymentVersion};
    use junobuild_cdn::storage::{ProposalAssetsStable, ProposalContentChunksStable};
    use junobuild_shared::ledger::types::cycles::CyclesTokens;
    use junobuild_shared::rate::types::{RateConfig, RateTokens};
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Controllers, Metadata, SegmentId, Timestamp};
    use junobuild_shared::types::state::{MissionControlId, UserId};
    use junobuild_storage::types::state::StorageHeapState;
    use serde::{Deserialize, Serialize};
    use std::collections::{HashMap, HashSet};

    pub type Accounts = HashMap<UserId, Account>;
    pub type IcpPayments = HashMap<BlockIndex, IcpPayment>;
    pub type IcrcPayments = HashMap<IcrcPaymentKey, IcrcPayment>;
    pub type InvitationCodes = HashMap<InvitationCode, InvitationCodeRedeem>;

    pub type AccountsStable = StableBTreeMap<UserId, Account, Memory>;
    pub type IcpPaymentsStable = StableBTreeMap<BlockIndex, IcpPayment, Memory>;
    pub type IcrcPaymentsStable = StableBTreeMap<IcrcPaymentKey, IcrcPayment, Memory>;
    pub type SegmentsStable = StableBTreeMap<SegmentKey, Segment, Memory>;

    #[derive(Serialize, Deserialize)]
    pub struct State {
        // Direct stable state: State that is uses stable memory directly as its store. No need for pre/post upgrade hooks.
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: HeapState,
    }

    pub struct StableState {
        pub accounts: AccountsStable,
        pub icp_payments: IcpPaymentsStable,
        pub icrc_payments: IcrcPaymentsStable,
        pub proposals_assets: ProposalAssetsStable,
        pub proposals_content_chunks: ProposalContentChunksStable,
        pub proposals: ProposalsStable,
        pub segments: SegmentsStable,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct HeapState {
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub mission_controls: Accounts,
        #[deprecated(note = "Deprecated. Use stable memory instead.")]
        pub payments: IcpPayments,
        pub invitation_codes: InvitationCodes,
        pub controllers: Controllers,
        pub rates: Rates,
        pub factory_fees: Option<FactoryFees>,
        pub storage: StorageHeapState,
        pub authentication: Option<AuthenticationHeapState>,
        pub releases_metadata: ReleasesMetadata,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Account {
        pub mission_control_id: Option<MissionControlId>,
        pub owner: UserId,
        pub provider: Option<Provider>,
        pub credits: Tokens,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum Provider {
        InternetIdentity,
        OpenId(OpenId),
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OpenId {
        pub provider: OpenIdProvider,
        pub data: OpenIdData,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Eq, PartialEq)]
    pub struct OpenIdData {
        pub email: Option<String>,
        pub name: Option<String>,
        pub given_name: Option<String>,
        pub family_name: Option<String>,
        pub picture: Option<String>,
        pub locale: Option<String>,
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
    pub struct FactoryFee {
        pub fee_cycles: CyclesTokens,
        pub fee_icp: Tokens,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct FactoryFees {
        pub satellite: FactoryFee,
        pub orbiter: FactoryFee,
        pub mission_control: FactoryFee,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Segment {
        pub segment_id: SegmentId,
        pub metadata: Metadata,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct SegmentKey {
        pub user: UserId,
        pub segment_type: SegmentType,
        pub segment_id: SegmentId,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub enum SegmentType {
        Satellite,
        Orbiter,
    }
}

pub mod interface {
    use crate::types::state::{Account, SegmentType};
    use candid::CandidType;
    use ic_ledger_types::Tokens;
    use junobuild_auth::delegation::types::{
        OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs, PrepareDelegationError,
        PreparedDelegation,
    };
    use junobuild_auth::state::types::config::AuthenticationConfig;
    use junobuild_cdn::proposals::ProposalId;
    use junobuild_shared::ledger::types::cycles::CyclesTokens;
    use junobuild_shared::types::state::{Metadata, SegmentId};
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

    #[derive(CandidType, Serialize, Deserialize)]
    pub enum AuthenticationArgs {
        OpenId(OpenIdPrepareDelegationArgs),
    }

    pub type AuthenticationResult = Result<Authentication, AuthenticationError>;

    #[derive(CandidType, Serialize, Deserialize)]
    pub struct Authentication {
        pub delegation: PreparedDelegation,
        pub account: Account,
    }

    #[derive(CandidType, Serialize, Deserialize)]
    pub enum AuthenticationError {
        PrepareDelegation(PrepareDelegationError),
        RegisterUser(String),
    }

    #[derive(CandidType, Serialize, Deserialize)]
    pub enum GetDelegationArgs {
        OpenId(OpenIdGetDelegationArgs),
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct ListSegmentsArgs {
        pub segment_type: Option<SegmentType>,
        pub segment_id: Option<SegmentId>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetSegmentMetadataArgs {
        pub segment_type: SegmentType,
        pub segment_id: SegmentId,
        pub metadata: Metadata,
    }

    #[derive(CandidType, Deserialize)]
    pub struct FeesArgs {
        pub fee_cycles: CyclesTokens,
        pub fee_icp: Tokens,
    }
}

pub mod ledger {
    use candid::{CandidType, Principal};
    use ic_ledger_types::{BlockIndex, Tokens};
    use icrc_ledger_types::icrc1::account::Account;
    use junobuild_shared::ledger::types::cycles::CyclesTokens;
    use junobuild_shared::types::state::{MissionControlId, Timestamp};
    use serde::{Deserialize, Serialize};

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct IcpPayment {
        pub mission_control_id: Option<MissionControlId>,
        pub block_index_payment: BlockIndex,
        pub block_index_refunded: Option<BlockIndex>,
        pub status: PaymentStatus,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct IcrcPayment {
        pub purchaser: Account,
        pub block_index_refunded: Option<BlockIndex>,
        pub status: PaymentStatus,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct IcrcPaymentKey {
        pub ledger_id: Principal,
        pub block_index: BlockIndex,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum PaymentStatus {
        Acknowledged,
        Completed,
        Refunded,
    }

    #[derive(Clone)]
    pub enum Fee {
        Cycles(CyclesTokens),
        ICP(Tokens),
    }
}
