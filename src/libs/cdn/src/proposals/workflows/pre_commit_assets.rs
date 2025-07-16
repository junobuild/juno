use crate::proposals::{Proposal, ProposalType};
use crate::storage::heap::store::delete_assets;
use crate::strategies::CdnHeapStrategy;
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;

pub fn pre_commit_assets(cdn_heap: &impl CdnHeapStrategy, proposal: &Proposal) {
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(ref options) => {
            // Clear existing assets if required.
            if let Some(true) = options.clear_existing_assets {
                delete_assets(cdn_heap, &COLLECTION_ASSET_KEY.to_string());
            }
        }
        ProposalType::SegmentsDeployment(_) => (),
    }
}
