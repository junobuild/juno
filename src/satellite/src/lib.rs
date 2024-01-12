use ic_cdk_macros::export_candid;
use junobuild_satellite::include_satellite;

include_satellite!();

// Generate did files

export_candid!();
