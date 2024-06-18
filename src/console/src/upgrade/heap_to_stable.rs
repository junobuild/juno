use crate::{
    store::heap::{list_mission_controls_heap, list_payments_heap},
    types::{ledger::Payment, state::MissionControl},
};
use ic_cdk::spawn;
use ic_cdk_timers::set_timer;
use ic_ledger_types::BlockIndex;
use ic_stable_structures::{StableBTreeMap, Storable};
use junobuild_shared::types::memory::Memory;
use junobuild_shared::types::state::UserId;
use std::collections::HashMap;
use std::time::Duration;
use crate::memory::STATE;

// One time migration of the mission controls from heap to stable
pub fn defer_migrate_mission_controls() {
    set_timer(Duration::ZERO, || spawn(migrate_mission_controls()));
}

// One time migration of the payments from heap to stable
pub fn defer_migrate_payments() {
    set_timer(Duration::ZERO, || spawn(migrate_payments()));
}

async fn migrate_mission_controls() {
    let mission_controls = list_mission_controls_heap();

    STATE.with(|state| {
        insert_data::<UserId, MissionControl>(
            &mission_controls,
            &mut state.borrow_mut().stable.mission_controls,
        )
    });
}

async fn migrate_payments() {
    let payments = list_payments_heap();

    STATE.with(|state| {
        insert_data::<BlockIndex, Payment>(&payments, &mut state.borrow_mut().stable.payments)
    });
}

fn insert_data<K, V>(data: &HashMap<K, V>, stable_map: &mut StableBTreeMap<K, V, Memory>)
where
    K: Clone + Ord + Storable,
    V: Clone + Storable,
{
    for (key, value) in data.iter() {
        stable_map.insert(key.clone(), value.clone());
    }
}
