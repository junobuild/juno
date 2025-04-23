use crate::events::helpers::assert_and_insert_track_event;
use crate::state::types::state::AnalyticKey;
use crate::types::interface::http::{
    SetTrackEventRequest, SetTrackEventsRequest, TrackEventPayload,
};
use ic_http_certification::HttpRequest;
use junobuild_utils::decode_doc_data;

pub fn handle_insert_track_event(request: &HttpRequest) -> Result<TrackEventPayload, String> {
    let SetTrackEventRequest { key, track_event }: SetTrackEventRequest =
        decode_doc_data::<SetTrackEventRequest>(request.body()).map_err(|e| e.to_string())?;

    let inserted_track_event =
        assert_and_insert_track_event(key.into_domain(), track_event.into_domain())?;

    Ok(TrackEventPayload::from_domain(inserted_track_event))
}

pub fn handle_insert_track_events(request: &HttpRequest) -> Result<(), String> {
    let track_events: SetTrackEventsRequest =
        decode_doc_data::<SetTrackEventsRequest>(request.body()).map_err(|e| e.to_string())?;

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for SetTrackEventRequest { key, track_event } in track_events {
        let key_domain = key.into_domain();

        let result = assert_and_insert_track_event(key_domain.clone(), track_event.into_domain());

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

    Ok(())
}
