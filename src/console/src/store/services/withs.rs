use crate::store::services::raw::{mutate_heap_state, read_heap_state};
use crate::store::{mutate_stable_state, read_stable_state};
use crate::types::state::{AccountsStable, FactoryFees, FactoryRates, SegmentsStable};
use crate::types::state::{IcpPaymentsStable, IcrcPaymentsStable};
use junobuild_auth::state::types::state::AuthenticationHeapState;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

pub fn with_assets<R>(f: impl FnOnce(&AssetsHeap) -> R) -> R {
    read_heap_state(|state| {
        let storage = &state.storage;
        f(&storage.assets)
    })
}

pub fn with_assets_mut<R>(f: impl FnOnce(&mut AssetsHeap) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.storage.assets))
}

pub fn with_config<R>(f: impl FnOnce(&StorageConfig) -> R) -> R {
    read_heap_state(|state| {
        let storage = &state.storage;
        f(&storage.config)
    })
}

pub fn with_auth<R>(f: impl FnOnce(&Option<AuthenticationHeapState>) -> R) -> R {
    read_heap_state(|state| {
        let authentication = &state.authentication;
        f(authentication)
    })
}

pub fn with_auth_mut<R>(f: impl FnOnce(&mut Option<AuthenticationHeapState>) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.authentication))
}

pub fn with_factory_fees<R>(f: impl FnOnce(&Option<FactoryFees>) -> R) -> R {
    read_heap_state(|state| {
        let fees = &state.factory_fees;
        f(fees)
    })
}

pub fn with_factory_fees_mut<R>(f: impl FnOnce(&mut Option<FactoryFees>) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.factory_fees))
}

pub fn with_factory_rates_mut<R>(f: impl FnOnce(&mut Option<FactoryRates>) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.factory_rates))
}

pub fn with_accounts<R>(f: impl FnOnce(&AccountsStable) -> R) -> R {
    read_stable_state(|state| {
        let accounts = &state.accounts;
        f(accounts)
    })
}

pub fn with_accounts_mut<R>(f: impl FnOnce(&mut AccountsStable) -> R) -> R {
    mutate_stable_state(|state| f(&mut state.accounts))
}

pub fn with_icp_payments<R>(f: impl FnOnce(&IcpPaymentsStable) -> R) -> R {
    read_stable_state(|state| {
        let payments = &state.icp_payments;
        f(payments)
    })
}

pub fn with_icrc_payments<R>(f: impl FnOnce(&IcrcPaymentsStable) -> R) -> R {
    read_stable_state(|state| {
        let payments = &state.icrc_payments;
        f(payments)
    })
}

pub fn with_icrc_payments_mut<R>(f: impl FnOnce(&mut IcrcPaymentsStable) -> R) -> R {
    mutate_stable_state(|state| f(&mut state.icrc_payments))
}

pub fn with_segments<R>(f: impl FnOnce(&SegmentsStable) -> R) -> R {
    read_stable_state(|state| {
        let segments = &state.segments;
        f(segments)
    })
}

pub fn with_segments_mut<R>(f: impl FnOnce(&mut SegmentsStable) -> R) -> R {
    mutate_stable_state(|state| f(&mut state.segments))
}
