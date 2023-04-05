use crate::satellites::store::get_satellites;
use crate::types::state::{Satellite, SatelliteId};
use futures::future::join_all;
use shared::ic::segment_status;
use shared::types::interface::{SegmentStatus, SegmentsStatuses};
use shared::types::state::MissionControlId;

pub async fn collect_statuses(
    mission_control_id: &MissionControlId,
    cycles_threshold: u64,
) -> SegmentsStatuses {
    let mission_control_check = mission_control_status(mission_control_id).await;

    // If the mission control has reached threshold we avoid additional calls to the satellites
    match mission_control_check {
        Err(_) => (),
        Ok(segment_status) => {
            if segment_status.status.cycles < cycles_threshold {
                return SegmentsStatuses {
                    mission_control: Ok(segment_status),
                    satellites: None,
                };
            }
        }
    }

    let satellites = satellites_status().await;
    let mission_control = mission_control_status(mission_control_id).await;

    SegmentsStatuses {
        mission_control,
        satellites: Some(satellites),
    }
}

pub async fn mission_control_status(
    mission_control_id: &MissionControlId,
) -> Result<SegmentStatus, String> {
    let result: Result<SegmentStatus, String> = segment_status(*mission_control_id).await;

    match result {
        Err(err) => Err(err),
        Ok(result) => Ok(SegmentStatus {
            id: *mission_control_id,
            metadata: None,
            status: result.status,
            status_at: result.status_at,
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
            metadata: _,
            status_at,
        } = segment_status(satellite_id).await?;

        Ok(SegmentStatus {
            id: satellite_id,
            metadata: Some(satellite.metadata),
            status,
            status_at,
        })
    }

    join_all(
        satellites
            .into_iter()
            .map(|(satellite_id, satellite)| satellite_status(satellite_id, satellite)),
    )
    .await
}
