use crate::assert::config::assert_track_events_enabled;
use crate::events::helpers::assert_and_insert_track_event;
use crate::handler::adapters::assert::assert_request;
use crate::handler::adapters::response_builder::build_payload_response;
use crate::http::types::handler::HandledUpdateResult;
use crate::http::types::request::HttpRequestBody;
use crate::state::types::state::AnalyticKey;
use crate::types::interface::http::{
    SetTrackEventPayload, SetTrackEventRequest, SetTrackEventsRequest, SetTrackEventsRequestEntry,
    TrackEventPayload,
};
use junobuild_utils::decode_doc_data;

pub fn assert_request_track_event(body: &HttpRequestBody) -> Result<(), String> {
    assert_request::<SetTrackEventRequest>(body, assert_track_events_enabled)
}

pub fn assert_request_track_events(body: &HttpRequestBody) -> Result<(), String> {
    assert_request::<SetTrackEventsRequest>(body, assert_track_events_enabled)
}

pub fn handle_insert_track_event(body: &HttpRequestBody) -> Result<HandledUpdateResult, String> {
    let SetTrackEventRequest {
        key,
        track_event,
        satellite_id,
    }: SetTrackEventRequest =
        decode_doc_data::<SetTrackEventRequest>(body).map_err(|e| e.to_string())?;

    let inserted_track_event = assert_and_insert_track_event(
        key.into_domain(),
        SetTrackEventPayload::convert_to_setter(track_event, &satellite_id)
            .map_err(|e| e.to_string())?,
    )?;

    let payload = TrackEventPayload::from_domain(inserted_track_event);

    build_payload_response(payload, &satellite_id)
}

pub fn handle_insert_track_events(body: &HttpRequestBody) -> Result<HandledUpdateResult, String> {
    let track_events: SetTrackEventsRequest =
        decode_doc_data::<SetTrackEventsRequest>(body).map_err(|e| e.to_string())?;

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for SetTrackEventsRequestEntry { key, track_event } in track_events.track_events {
        let key_domain = key.into_domain();

        let result = assert_and_insert_track_event(
            key_domain.clone(),
            SetTrackEventPayload::convert_to_setter(track_event, &track_events.satellite_id)
                .map_err(|e| e.to_string())?,
        );

        match result {
            Ok(_) => {}
            Err(err) => errors.push((key_domain, err)),
        }
    }

    if !errors.is_empty() {
        let error_string = errors
            .into_iter()
            .map(|(key, err)| format!("{}: {}", key.key, err))
            .collect::<Vec<_>>()
            .join(", ");

        return Err(error_string);
    }

    build_payload_response((), &track_events.satellite_id)
}
