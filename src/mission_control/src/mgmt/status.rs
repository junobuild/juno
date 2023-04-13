use crate::mgmt::constants::CYCLES_MIN_THRESHOLD;
use crate::satellites::store::get_satellites;
use crate::types::state::Satellite;
use futures::future::join_all;
use shared::ic::segment_status;
use shared::types::cronjob::CronJobStatusesSatellites;
use shared::types::interface::StatusesArgs;
use shared::types::state::{MissionControlId, SatelliteId, SegmentStatus, SegmentsStatuses};

pub async fn collect_statuses(
    mission_control_id: &MissionControlId,
    config: &StatusesArgs,
) -> SegmentsStatuses {
    let mission_control_check = mission_control_status(mission_control_id).await;

    // If the mission control has reached threshold we avoid additional calls to the satellites
    match mission_control_check {
        Err(_) => (),
        Ok(segment_status) => {
            if !assert_threshold(config, &segment_status) {
                return SegmentsStatuses {
                    mission_control: Ok(segment_status),
                    satellites: None,
                };
            }
        }
    }

    let satellites = satellites_status(&config.satellites).await;
    let mission_control = mission_control_status(mission_control_id).await;

    SegmentsStatuses {
        mission_control,
        satellites: Some(satellites),
    }
}

pub fn assert_threshold(config: &StatusesArgs, segment_status: &SegmentStatus) -> bool {
    let config_threshold = match config.mission_control_cycles_threshold {
        None => config.cycles_threshold,
        Some(mission_control_cycles_threshold) => Some(mission_control_cycles_threshold),
    };

    let cycles_threshold = match config_threshold {
        None => CYCLES_MIN_THRESHOLD,
        Some(threshold) => {
            if threshold < CYCLES_MIN_THRESHOLD {
                CYCLES_MIN_THRESHOLD
            } else {
                threshold
            }
        }
    };

    segment_status.status.cycles >= cycles_threshold
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

async fn satellites_status(
    satellites_config: &CronJobStatusesSatellites,
) -> Vec<Result<SegmentStatus, String>> {
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

    fn filter_enabled_satellite_status(
        satellite_id: &SatelliteId,
        satellites_config: &CronJobStatusesSatellites,
    ) -> bool {
        let config = satellites_config.get(satellite_id);

        match config {
            None => true,
            Some(config) => config.enabled,
        }
    }

    join_all(
        satellites
            .into_iter()
            .filter(|(satellite_id, _)| {
                filter_enabled_satellite_status(satellite_id, satellites_config)
            })
            .map(|(satellite_id, satellite)| satellite_status(satellite_id, satellite)),
    )
    .await
}
