#![deny(clippy::disallowed_methods)]

mod api;
mod constants;
mod controllers;
mod guards;
mod impls;
mod memory;
mod monitoring;
mod random;
mod segments;
mod types;
mod user;

use crate::types::interface::CreateCanisterConfig;
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
use ic_cdk_macros::export_candid;
use ic_ledger_types::Tokens;
use ic_ledger_types::TransferArgs;
use ic_ledger_types::TransferResult;
use icrc_ledger_types::icrc1::transfer::TransferArg;
use junobuild_shared::ledger::types::icrc::IcrcTransferResult;
use junobuild_shared::types::interface::DepositCyclesArgs;
use junobuild_shared::types::interface::MissionControlArgs;
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::Metadata;
use junobuild_shared::types::state::SatelliteId;
use junobuild_shared::types::state::UserId;
use junobuild_shared::types::state::{ControllerId, Controllers, OrbiterId};

export_candid!();
