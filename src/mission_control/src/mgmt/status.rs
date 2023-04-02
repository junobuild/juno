use crate::satellites::store::get_satellites;
use crate::store::get_metadata;
use crate::types::state::{Satellite, SatelliteId};
use candid::Principal;
use futures::future::join_all;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::ic::segment_status;
use shared::types::interface::{SegmentStatus, SegmentsStatus};
use shared::types::state::MissionControlId;

pub async fn collect_statuses(
    mission_control_id: &MissionControlId,
    version: &str,
    cycles_threshold: u64,
) -> SegmentsStatus {
    let mission_control_check = mission_control_status(mission_control_id, version).await;

    // If the mission control has reached threshold we avoid addition calls to the satellites
    match mission_control_check {
        Err(_) => (),
        Ok(segment_status) => {
            if segment_status.status.cycles < cycles_threshold {
                return SegmentsStatus {
                    mission_control: Ok(segment_status),
                    satellites: None,
                };
            }
        }
    }

    let satellites = satellites_status().await;
    let mission_control = mission_control_status(mission_control_id, version).await;

    SegmentsStatus {
        mission_control,
        satellites: Some(satellites),
    }
}

pub async fn mission_control_status(
    mission_control_id: &MissionControlId,
    version: &str,
) -> Result<SegmentStatus, String> {
    let result: Result<SegmentStatus, String> =
        segment_status(*mission_control_id, version.to_owned()).await;

    match result {
        Err(err) => Err(err),
        Ok(result) => Ok(SegmentStatus {
            id: *mission_control_id,
            metadata: Some(get_metadata()),
            version: version.to_owned(),
            status: result.status,
        }),
    }
}

async fn satellites_status() -> Vec<Result<SegmentStatus, String>> {
    let satellites = get_satellites();

    async fn satellite_status(
        satellite_id: SatelliteId,
        satellite: Satellite,
    ) -> Result<SegmentStatus, String> {
        let SegmentStatus {
            id: _,
            status,
            version,
            metadata: _,
        } = status(satellite_id).await?;

        Ok(SegmentStatus {
            id: satellite_id,
            metadata: Some(satellite.metadata),
            status,
            version,
        })
    }

    join_all(
        satellites
            .into_iter()
            .map(|(satellite_id, satellite)| satellite_status(satellite_id, satellite)),
    )
    .await
}

async fn status(canister_id: Principal) -> Result<SegmentStatus, String> {
    let result: CallResult<(SegmentStatus,)> = call(canister_id, "status", ((),)).await;

    match result {
        Err((_, message)) => Err(message),
        Ok((status,)) => Ok(status),
    }
}
