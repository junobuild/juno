use crate::proposals::{Proposal, ProposalId, ProposalKey};
use candid::{CandidType, Deserialize};
use ic_stable_structures::StableBTreeMap;
use junobuild_shared::types::core::Hash;
use junobuild_shared::types::memory::Memory;
use serde::Serialize;

pub type ProposalsStable = StableBTreeMap<ProposalKey, Proposal, Memory>;

#[derive(Debug)]
pub enum CommitProposalError {
    ProposalNotFound(String),
    ProposalNotOpen(String),
    InvalidSha256(String),
    InvalidType(String),
    CommitAssetsIssue(String),
    PostCommitAssetsIssue(String),
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct CommitProposal {
    pub proposal_id: ProposalId,
    pub sha256: Hash,
}
