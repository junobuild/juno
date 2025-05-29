use crate::proposals::ProposalId;
use candid::{CandidType, Deserialize};
use junobuild_shared::types::core::Hash;
use serde::Serialize;

#[derive(Debug)]
pub enum RejectProposalError {
    ProposalNotFound(String),
    ProposalNotOpen(String),
    InvalidSha256(String),
    InvalidType(String),
}

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

pub type RejectProposal = CommitProposal;
