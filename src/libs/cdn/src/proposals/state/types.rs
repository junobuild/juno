use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::StableBTreeMap;
use junobuild_shared::types::core::Hash;
use junobuild_shared::types::memory::Memory;
use junobuild_shared::types::state::{Timestamp, Version};
use serde::Serialize;

pub type ProposalsStable = StableBTreeMap<ProposalKey, Proposal, Memory>;

pub type ProposalId = u128;

#[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ProposalKey {
    pub proposal_id: ProposalId,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Proposal {
    pub owner: Principal,
    pub sha256: Option<Hash>,
    pub status: ProposalStatus,
    pub executed_at: Option<Timestamp>,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
    pub version: Option<Version>,
    pub proposal_type: ProposalType,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum ProposalType {
    AssetsUpgrade(AssetsUpgradeOptions),
    SegmentsDeployment(SegmentsDeploymentOptions),
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct AssetsUpgradeOptions {
    pub clear_existing_assets: Option<bool>,
}

pub type SegmentDeploymentVersion = String;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct SegmentsDeploymentOptions {
    pub satellite_version: Option<SegmentDeploymentVersion>,
    pub mission_control_version: Option<SegmentDeploymentVersion>,
    pub orbiter: Option<SegmentDeploymentVersion>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum ProposalStatus {
    Initialized,
    Open,
    Rejected,
    Accepted,
    Executed,
    Failed,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct ListProposalsParams {
    pub paginate: Option<ListProposalsPaginate>,
    pub order: Option<ListProposalsOrder>,
}

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct ListProposalsPaginate {
    pub start_after: Option<ProposalId>,
    pub limit: Option<u128>,
}

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct ListProposalsOrder {
    pub desc: bool,
}

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct ListProposalResults {
    pub items: Vec<(ProposalKey, Proposal)>,
    pub items_length: usize,
    pub matches_length: usize,
}
