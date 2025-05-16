use crate::proposals::types::CommitProposalError;
use std::fmt;

impl fmt::Display for CommitProposalError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CommitProposalError::ProposalNotFound(err) => write!(f, "{}", err),
            CommitProposalError::ProposalNotOpen(err) => write!(f, "{}", err),
            CommitProposalError::InvalidSha256(err) => write!(f, "{}", err),
            CommitProposalError::InvalidType(err) => write!(f, "{}", err),
            CommitProposalError::CommitAssetsIssue(err) => write!(f, "{}", err),
            CommitProposalError::PostCommitAssetsIssue(err) => write!(f, "{}", err),
        }
    }
}
