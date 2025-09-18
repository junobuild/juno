use crate::proposals::types::CommitProposalError;
use crate::proposals::RejectProposalError;
use std::fmt;

impl fmt::Display for CommitProposalError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CommitProposalError::ProposalNotFound(err) => write!(f, "{err}"),
            CommitProposalError::ProposalNotOpen(err) => write!(f, "{err}"),
            CommitProposalError::InvalidSha256(err) => write!(f, "{err}"),
            CommitProposalError::InvalidType(err) => write!(f, "{err}"),
            CommitProposalError::CommitAssetsIssue(err) => write!(f, "{err}"),
            CommitProposalError::PreCommitAssetsIssue(err) => write!(f, "{err}"),
            CommitProposalError::PostCommitAssetsIssue(err) => write!(f, "{err}"),
        }
    }
}

impl fmt::Display for RejectProposalError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            RejectProposalError::ProposalNotFound(err) => write!(f, "{err}"),
            RejectProposalError::ProposalNotOpen(err) => write!(f, "{err}"),
            RejectProposalError::InvalidSha256(err) => write!(f, "{err}"),
            RejectProposalError::InvalidType(err) => write!(f, "{err}"),
        }
    }
}
