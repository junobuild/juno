use crate::store::services::raw::{mutate_heap_state, read_heap_state};
use crate::store::{mutate_stable_state, read_stable_state};
use crate::types::state::{Fees, PaymentsStable};
use crate::types::state::{AccountsStable, SegmentsStable};
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

pub fn with_fees<R>(f: impl FnOnce(&Fees) -> R) -> R {
    read_heap_state(|state| {
        let fees = &state.fees;
        f(&fees)
    })
}

pub fn with_fees_mut<R>(f: impl FnOnce(&mut Fees) -> R) -> R {
    mutate_heap_state(|state| f(&mut state.fees))
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

pub fn with_payments<R>(f: impl FnOnce(&PaymentsStable) -> R) -> R {
    read_stable_state(|state| {
        let payments = &state.payments;
        f(payments)
    })
}

pub fn with_payments_mut<R>(f: impl FnOnce(&mut PaymentsStable) -> R) -> R {
    mutate_stable_state(|state| f(&mut state.payments))
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
