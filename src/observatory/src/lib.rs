#![deny(clippy::disallowed_methods)]

mod api;
mod console;
mod guards;
mod impls;
mod memory;
mod notification;
mod random;
mod store;
mod templates;
mod types;

use crate::types::interface::GetNotifications;
use crate::types::interface::NotifyStatus;
use ic_cdk_macros::export_candid;
export_candid!();
