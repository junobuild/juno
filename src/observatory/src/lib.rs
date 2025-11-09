#![deny(clippy::disallowed_methods)]

mod api;
mod console;
mod guards;
mod impls;
mod memory;
mod notifications;
mod openid;
mod random;
mod store;
mod templates;
mod types;

use crate::types::interface::GetNotifications;
use crate::types::interface::NotifyStatus;
use crate::types::state::Env;
use ic_cdk_macros::export_candid;
use junobuild_auth::openid::jwkset::types::interface::GetOpenIdCertificateArgs;
use junobuild_auth::openid::types::provider::OpenIdCertificate;
use junobuild_shared::types::interface::NotifyArgs;
use junobuild_shared::types::interface::{DeleteControllersArgs, SetControllersArgs};
use junobuild_shared::types::state::Controllers;

export_candid!();
