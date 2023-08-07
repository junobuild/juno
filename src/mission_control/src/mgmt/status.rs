use crate::mgmt::constants::CYCLES_MIN_THRESHOLD;
use crate::segments::store::{get_orbiters, get_satellites};
use crate::store::{set_mission_control_status, set_orbiter_status, set_satellite_status};
use candid::Principal;
use futures::future::join_all;
use shared::ic::segment_status as ic_segment_status;
use shared::types::cronjob::CronJobStatusesSegments;
use shared::types::interface::StatusesArgs;
use shared::types::state::{
    Metadata, MissionControlId, SatelliteId, SegmentStatus, SegmentStatusResult, SegmentsStatuses,
};

pub async fn collect_statuses(
    mission_control_id: &MissionControlId,
    config: &StatusesArgs,
) -> SegmentsStatuses {
    let mission_control_check = mission_control_status(mission_control_id).await;

    // If the mission control has already reached threshold or gives an error we avoid additional calls to the satellites
    match mission_control_check {
        Err(err) => {
            return SegmentsStatuses {
                mission_control: Err(err),
                satellites: None,
                orbiters: None,
            };
        }
        Ok(segment_status) => {
            if !assert_threshold(config, &segment_status) {
                return SegmentsStatuses {
                    mission_control: Ok(segment_status),
                    satellites: None,
                    orbiters: None,
                };
            }
        }
    }

    let satellites = satellites_status(&config.satellites).await;
    let orbiters = orbiters_status(&config.orbiters).await;
    let mission_control = mission_control_status(mission_control_id).await;

    SegmentsStatuses {
        mission_control,
        satellites: Some(satellites),
        orbiters: Some(orbiters),
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

pub async fn mission_control_status(mission_control_id: &MissionControlId) -> SegmentStatusResult {
    let result: SegmentStatusResult = ic_segment_status(*mission_control_id).await;

    set_mission_control_status(&result);

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

fn filter_enabled_segment_status(
    id: &Principal,
    segments_config: &CronJobStatusesSegments,
) -> bool {
    let config = segments_config.get(id);

    match config {
        None => true,
        Some(config) => config.enabled,
    }
}

async fn satellites_status(
    satellites_config: &CronJobStatusesSegments,
) -> Vec<SegmentStatusResult> {
    let satellites = get_satellites();

    let segments = satellites
        .into_iter()
        .filter(|(satellite_id, _)| filter_enabled_segment_status(satellite_id, satellites_config))
        .map(|(satellite_id, satellite)| (satellite_id, satellite.metadata.clone()))
        .collect();

    canisters_status(segments, &set_satellite_status).await
}

async fn orbiters_status(orbiters_config: &CronJobStatusesSegments) -> Vec<SegmentStatusResult> {
    let orbiters = get_orbiters();

    let segments = orbiters
        .into_iter()
        .filter(|(orbiter_id, _)| filter_enabled_segment_status(orbiter_id, orbiters_config))
        .map(|(orbiter_id, orbiter)| (orbiter_id, orbiter.metadata.clone()))
        .collect();

    canisters_status(segments, &set_orbiter_status).await
}

async fn canisters_status(
    segments: Vec<(Principal, Metadata)>,
    set_status: &dyn Fn(&SatelliteId, &SegmentStatusResult),
) -> Vec<SegmentStatusResult> {
    async fn segment_status(
        id: Principal,
        metadata: Metadata,
        set_status: &dyn Fn(&SatelliteId, &SegmentStatusResult),
    ) -> SegmentStatusResult {
        let result: SegmentStatusResult = ic_segment_status(id).await;

        set_status(&id, &result);

        match result {
            Err(err) => Err(err),
            Ok(result) => Ok(SegmentStatus {
                id,
                metadata: Some(metadata),
                status: result.status,
                status_at: result.status_at,
            }),
        }
    }

    join_all(
        segments
            .into_iter()
            .map(|(id, metadata)| segment_status(id, metadata, set_status)),
    )
    .await
}
