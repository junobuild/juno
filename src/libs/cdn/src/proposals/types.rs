#[derive(Debug)]
pub enum CommitProposalError {
    ProposalNotFound(String),
    ProposalNotOpen(String),
    InvalidSha256(String),
    InvalidType(String),
    CommitAssetsIssue(String),
    PostCommitAssetsIssue(String),
}
