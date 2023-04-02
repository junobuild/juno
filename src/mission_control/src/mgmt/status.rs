use crate::satellites::store::get_satellites;
use crate::store::get_metadata;
use crate::types::state::{Satellite, SatelliteId};
use futures::future::join_all;
use ic_cdk::api::call::CallResult;
use ic_cdk::api::management_canister::main::CanisterStatusResponse;
use ic_cdk::call;
use ic_cdk::id;
use shared::types::interface::{SegmentStatus, SegmentsStatus};

pub async fn collect_statuses() -> SegmentsStatus {
    let mission_control = mission_control_status().await;

    // TODO: if threshold reached do not call satellites

    let satellites = satellites_status().await;

    SegmentsStatus {
        mission_control,
        satellites,
    }
}

async fn mission_control_status() -> Result<SegmentStatus, String> {
    let mission_control_id = id();
    let status = status(mission_control_id).await;

    match status {
        Err(err) => Err(err),
        Ok(status) => Ok(SegmentStatus {
            id: mission_control_id,
            status,
            metadata: get_metadata(),
        }),
    }
}

async fn satellites_status() -> Vec<Result<SegmentStatus, String>> {
    let satellites = get_satellites();

    async fn satellite_status(
        satellite_id: SatelliteId,
        satellite: Satellite,
    ) -> Result<SegmentStatus, String> {
        let sat_status = status(satellite_id).await?;

        Ok(SegmentStatus {
            id: satellite_id,
            metadata: satellite.metadata,
            status: sat_status,
        })
    }

    join_all(
        satellites
            .into_iter()
            .map(|(satellite_id, satellite)| satellite_status(satellite_id, satellite)),
    )
    .await
}

async fn status(satellite_id: SatelliteId) -> Result<CanisterStatusResponse, String> {
    let result: CallResult<(CanisterStatusResponse,)> = call(satellite_id, "status", ((),)).await;

    match result {
        Err((_, message)) => Err(message),
        Ok((status,)) => Ok(status),
    }
}
