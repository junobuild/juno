#![deny(clippy::disallowed_methods)]

mod api;
mod cdn;
mod constants;
mod controllers;
mod guards;
mod impls;
mod lifecycle;
mod memory;
mod monitoring;
mod random;
mod segments;
mod types;
mod upgrade;
mod user;

use crate::types::interface::CreateCanisterConfig;
use crate::types::interface::DeleteProposalAssets;
use crate::types::interface::GetMonitoringHistory;
use crate::types::interface::MonitoringStartConfig;
use crate::types::interface::MonitoringStatus;
use crate::types::interface::MonitoringStopConfig;
use crate::types::state::Config;
use crate::types::state::MissionControlSettings;
use crate::types::state::MonitoringHistory;
use crate::types::state::MonitoringHistoryKey;
use crate::types::state::Orbiter;
use crate::types::state::Orbiters;
use crate::types::state::Satellite;
use crate::types::state::Satellites;
use crate::types::state::User;
use candid::Principal;
use ic_cdk::api::call::ManualReply;
use ic_cdk_macros::export_candid;
use ic_ledger_types::Tokens;
use ic_ledger_types::TransferArgs;
use ic_ledger_types::TransferResult;
use icrc_ledger_types::icrc1::transfer::TransferArg;
use junobuild_cdn::proposals::CommitProposal;
use junobuild_cdn::proposals::Proposal;
use junobuild_cdn::proposals::ProposalId;
use junobuild_cdn::proposals::ProposalType;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::ledger::types::icrc::IcrcTransferResult;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::interface::{DepositCyclesArgs, SetController};
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_shared::types::state::{ControllerId, Controllers, OrbiterId, SatelliteId};
use junobuild_shared::types::state::{Metadata, UserId};
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::AssetNoContent;
use junobuild_storage::types::interface::CommitBatch;
use junobuild_storage::types::interface::InitAssetKey;
use junobuild_storage::types::interface::InitUploadResult;
use junobuild_storage::types::interface::UploadChunk;
use junobuild_storage::types::interface::UploadChunkResult;

export_candid!();
