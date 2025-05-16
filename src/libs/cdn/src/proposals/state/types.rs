use candid::{CandidType, Deserialize, Principal};
use junobuild_shared::types::core::Hash;
use junobuild_shared::types::state::{Timestamp, Version};
use serde::Serialize;

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
