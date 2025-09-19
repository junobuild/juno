use crate::proposals::{Proposal, ProposalType};
use crate::strategies::CdnCommitAssetsStrategy;
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;

pub fn pre_commit_assets(
    cdn_commit_assets: &impl CdnCommitAssetsStrategy,
    proposal: &Proposal,
) -> Result<(), String> {
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(ref options) => {
            // Clear existing assets if required.
            if let Some(true) = options.clear_existing_assets {
                cdn_commit_assets.delete_assets(&COLLECTION_ASSET_KEY.to_string())?;
            }
        }
        ProposalType::SegmentsDeployment(_) => (),
    }

    Ok(())
}
