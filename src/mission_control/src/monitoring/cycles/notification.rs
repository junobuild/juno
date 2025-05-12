use crate::monitoring::cycles::utils::{get_deposited_cycles, get_funding_failure};
use crate::monitoring::observatory::notify_observatory;
use crate::segments::store::{get_orbiter, get_satellite};
use crate::user::store::{get_config, get_metadata, get_user};
use canfund::manager::record::CanisterRecord;
use ic_cdk::api::management_canister::main::CanisterId;
use ic_cdk::{id, print, spawn};
use ic_cdk_timers::set_timer;
use junobuild_shared::types::interface::NotifyArgs;
use junobuild_shared::types::monitoring::{CyclesBalance, FundingFailure};
use junobuild_shared::types::state::{
    DepositedCyclesEmailNotification, FailedCyclesDepositEmailNotification, Metadata,
    NotificationKind, Segment, SegmentKind,
};
use junobuild_shared::utils::principal_equal;
use std::collections::HashMap;
use std::time::Duration;

pub fn defer_notify(records: HashMap<CanisterId, CanisterRecord>) {
    set_timer(Duration::ZERO, || spawn(notify(records)));
}

async fn notify(records: HashMap<CanisterId, CanisterRecord>) {
    for (canister_id, record) in records.iter() {
        let deposited_cycles = get_deposited_cycles(record);

        if let Some(deposited_cycles) = deposited_cycles {
            let args = prepare_cycles_args(canister_id, &deposited_cycles);
            try_notify_observatory(&args).await;
        }

        let funding_failure = get_funding_failure(record);

        if let Some(funding_failure) = funding_failure {
            let args = prepare_failed_cycles_args(canister_id, &funding_failure);
            try_notify_observatory(&args).await;
        }
    }
}

async fn try_notify_observatory(args: &Option<NotifyArgs>) {
    if let Some(args) = args {
        if let Err(e) = notify_observatory(&args).await {
            // Maybe in the future, we can track the potential transmission of the notification error, but for now, we’ll simply log it.
            print(e);
        }
    }
}

fn prepare_cycles_args(
    canister_id: &CanisterId,
    deposited_cycles: &CyclesBalance,
) -> Option<NotifyArgs> {
    prepare_args(canister_id, |email| {
        NotificationKind::DepositedCyclesEmail(DepositedCyclesEmailNotification {
            to: email,
            deposited_cycles: deposited_cycles.clone(),
        })
    })
}

fn prepare_failed_cycles_args(
    canister_id: &CanisterId,
    funding_failure: &FundingFailure,
) -> Option<NotifyArgs> {
    prepare_args(canister_id, |email| {
        NotificationKind::FailedCyclesDepositEmail(FailedCyclesDepositEmailNotification {
            to: email,
            funding_failure: funding_failure.clone(),
        })
    })
}

fn prepare_args<F>(canister_id: &CanisterId, build_kind: F) -> Option<NotifyArgs>
where
    F: FnOnce(String) -> NotificationKind,
{
    let config = get_config()?.monitoring?.cycles?.notification?;

    if !config.enabled {
        return None;
    }

    let email = config.to.or_else(|| get_metadata().get("email").cloned())?;

    let segment = get_segment(canister_id)?;

    let user = get_user();

    Some(NotifyArgs {
        user,
        segment,
        kind: build_kind(email),
    })
}

fn get_segment(canister_id: &CanisterId) -> Option<Segment> {
    fn map_metadata(metadata: Metadata) -> Option<Metadata> {
        if metadata.is_empty() {
            None
        } else {
            Some(metadata)
        }
    }

    if principal_equal(*canister_id, id()) {
        let metadata = get_metadata();
        return Some(Segment {
            id: *canister_id,
            kind: SegmentKind::MissionControl,
            metadata: map_metadata(metadata),
        });
    }

    if let Some(orbiter) = get_orbiter(canister_id) {
        return Some(Segment {
            id: *canister_id,
            kind: SegmentKind::Orbiter,
            metadata: map_metadata(orbiter.metadata),
        });
    }

    if let Some(satellite) = get_satellite(canister_id) {
        return Some(Segment {
            id: *canister_id,
            kind: SegmentKind::Satellite,
            metadata: map_metadata(satellite.metadata),
        });
    }

    None
}
