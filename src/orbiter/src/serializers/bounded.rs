use crate::constants::{
    METADATA_MAX_ELEMENTS, SERIALIZED_KEY_LENGTH, SERIALIZED_LONG_STRING_LENGTH,
    SERIALIZED_METADATA_LENGTH, SERIALIZED_PRINCIPAL_LENGTH, SERIALIZED_SHORT_STRING_LENGTH,
    SERIALIZED_STRING_LENGTH,
};
use crate::serializers::constants::{
    ANALYTIC_KEY_MAX_SIZE, ANALYTIC_SATELLITE_KEY_MAX_SIZE, TIMESTAMP_LENGTH,
};
use crate::serializers::utils::{
    bytes_to_key, bytes_to_long_string, bytes_to_metadata, bytes_to_principal,
    bytes_to_short_string, bytes_to_string, key_to_bytes, long_string_to_bytes, metadata_to_bytes,
    principal_to_bytes, short_string_to_bytes, string_to_bytes,
};
use crate::state::types::state::{
    AnalyticKey, AnalyticSatelliteKey, PageView, PageViewDevice, TrackEvent,
};
use std::borrow::Cow;
use std::mem::size_of;

// updated_at and created_at
const TIMESTAMPS_LENGTH: usize = TIMESTAMP_LENGTH * 2;

// Size of PageView:
// - title (String)
// - href (Long string)
// - referrer (Option<Long string>)
// - device (2 * u16)
// - user_agent (Option<String>)
// - time_zone (short String)
// - Principal to bytes (30 because a principal is max 29 bytes and one byte to save effective length)
// - session_id (SERIALIZED_KEY_LENGTH)
// - created_at + updated_at (2 * u64)
const PAGE_VIEW_MAX_SIZE: usize = (SERIALIZED_STRING_LENGTH * 2)
    + SERIALIZED_SHORT_STRING_LENGTH
    + (SERIALIZED_LONG_STRING_LENGTH * 2)
    + SERIALIZED_PRINCIPAL_LENGTH
    + SERIALIZED_KEY_LENGTH
    + TIMESTAMPS_LENGTH
    + (size_of::<u16>() * 2);

pub fn serialize_bounded_page_view_into_bytes(page_view: &PageView) -> Vec<u8> {
    let mut buf = Vec::with_capacity(PAGE_VIEW_MAX_SIZE);

    buf.extend(string_to_bytes(&page_view.title));
    buf.extend(long_string_to_bytes(&page_view.href));
    buf.extend(long_string_to_bytes(
        &page_view.referrer.clone().unwrap_or("".to_string()),
    ));
    buf.extend(page_view.device.inner_width.to_be_bytes());
    buf.extend(page_view.device.inner_height.to_be_bytes());
    buf.extend(string_to_bytes(
        &page_view.user_agent.clone().unwrap_or("".to_string()),
    ));
    buf.extend(short_string_to_bytes(&page_view.time_zone));
    buf.extend(principal_to_bytes(&page_view.satellite_id));
    buf.extend(key_to_bytes(&page_view.session_id));
    buf.extend(page_view.created_at.to_be_bytes());
    buf.extend(page_view.updated_at.to_be_bytes());

    buf
}

pub fn serialize_bounded_page_view_to_bytes(page_view: &PageView) -> Cow<[u8]> {
    let buf = serialize_bounded_page_view_into_bytes(page_view);
    Cow::Owned(buf)
}

pub fn deserialize_bounded_page_view(bytes: Cow<[u8]>) -> PageView {
    let mut index = 0;

    let title = bytes_to_string(
        TryFrom::try_from(&bytes[0..SERIALIZED_STRING_LENGTH])
            .expect("Failed to deserialize title"),
    );

    index += SERIALIZED_STRING_LENGTH;

    let href = bytes_to_long_string(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_LONG_STRING_LENGTH])
            .expect("Failed to deserialize href"),
    );

    index += SERIALIZED_LONG_STRING_LENGTH;

    let referrer = bytes_to_long_string(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_LONG_STRING_LENGTH])
            .expect("Failed to deserialize referrer"),
    );

    let referrer_opt = match referrer.is_empty() {
        true => None,
        false => Some(referrer),
    };

    index += SERIALIZED_LONG_STRING_LENGTH;

    let inner_width = u16::from_be_bytes(
        TryFrom::try_from(&bytes[index..index + size_of::<u16>()])
            .expect("Failed to deserialize inner_width"),
    );

    index += size_of::<u16>();

    let inner_height = u16::from_be_bytes(
        TryFrom::try_from(&bytes[index..index + size_of::<u16>()])
            .expect("Failed to deserialize inner_height"),
    );

    index += size_of::<u16>();

    let user_agent = bytes_to_string(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_STRING_LENGTH])
            .expect("Failed to deserialize user_agent"),
    );

    let user_agent_opt = match user_agent.is_empty() {
        true => None,
        false => Some(user_agent),
    };

    index += SERIALIZED_STRING_LENGTH;

    let time_zone = bytes_to_short_string(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_SHORT_STRING_LENGTH])
            .expect("Failed to deserialize time_zone"),
    );

    index += SERIALIZED_SHORT_STRING_LENGTH;

    let satellite_id = bytes_to_principal(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_PRINCIPAL_LENGTH])
            .expect("Failed to deserialize satellite_id"),
    );

    index += SERIALIZED_PRINCIPAL_LENGTH;

    let session_id = bytes_to_key(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_KEY_LENGTH])
            .expect("Failed to deserialize session_id"),
    );

    index += SERIALIZED_KEY_LENGTH;

    let created_at = u64::from_be_bytes(
        TryFrom::try_from(&bytes[index..index + TIMESTAMP_LENGTH])
            .expect("Failed to deserialize created_at"),
    );

    index += TIMESTAMP_LENGTH;

    let updated_at = u64::from_be_bytes(
        TryFrom::try_from(&bytes[index..index + TIMESTAMP_LENGTH])
            .expect("Failed to deserialize updated_at"),
    );

    PageView {
        title,
        href,
        referrer: referrer_opt,
        device: PageViewDevice {
            inner_width,
            inner_height,
            screen_width: None,
            screen_height: None,
        },
        user_agent: user_agent_opt,
        client: None,
        time_zone,
        satellite_id,
        session_id,
        campaign: None,
        created_at,
        updated_at,
        version: None,
    }
}

// Size of TrackEvent:
// - name (String)
// - metadata (2 * String) limited to TRACK_EVENT_METADATA_MAX_LENGTH entries
// - Principal to bytes (30 because a principal is max 29 bytes and one byte to save effective length)
// - session_id (SERIALIZED_KEY_LENGTH)
// - created_at + updated_at (2 * u64)
const TRACK_EVENT_MAX_SIZE: usize = SERIALIZED_SHORT_STRING_LENGTH
    + SERIALIZED_KEY_LENGTH
    + SERIALIZED_PRINCIPAL_LENGTH
    + TIMESTAMPS_LENGTH
    + (SERIALIZED_SHORT_STRING_LENGTH * 2 * METADATA_MAX_ELEMENTS);

pub fn serialize_bounded_track_event_into_bytes(track_event: &TrackEvent) -> Vec<u8> {
    let mut buf = Vec::with_capacity(TRACK_EVENT_MAX_SIZE);

    buf.extend(short_string_to_bytes(&track_event.name));
    buf.extend(metadata_to_bytes(&track_event.metadata));
    buf.extend(principal_to_bytes(&track_event.satellite_id));
    buf.extend(key_to_bytes(&track_event.session_id));
    buf.extend(track_event.created_at.to_be_bytes());
    buf.extend(track_event.updated_at.to_be_bytes());

    buf
}

pub fn serialize_bounded_track_event_to_bytes(track_event: &TrackEvent) -> Cow<[u8]> {
    let buf = serialize_bounded_track_event_into_bytes(track_event);
    Cow::Owned(buf)
}

pub fn deserialize_bounded_track_event(bytes: Cow<[u8]>) -> TrackEvent {
    let mut index = 0;

    let name = bytes_to_short_string(
        TryFrom::try_from(&bytes[0..SERIALIZED_SHORT_STRING_LENGTH])
            .expect("Failed to deserialize name"),
    );

    index += SERIALIZED_SHORT_STRING_LENGTH;

    let metadata = bytes_to_metadata(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_METADATA_LENGTH])
            .expect("Failed to deserialize name"),
    );

    index += SERIALIZED_METADATA_LENGTH;

    let satellite_id = bytes_to_principal(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_PRINCIPAL_LENGTH])
            .expect("Failed to deserialize satellite_id"),
    );

    index += SERIALIZED_PRINCIPAL_LENGTH;

    let session_id = bytes_to_key(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_KEY_LENGTH])
            .expect("Failed to deserialize session_id"),
    );

    index += SERIALIZED_KEY_LENGTH;

    let created_at = u64::from_be_bytes(
        TryFrom::try_from(&bytes[index..index + TIMESTAMP_LENGTH])
            .expect("Failed to deserialize created_at"),
    );

    index += TIMESTAMP_LENGTH;

    let updated_at = u64::from_be_bytes(
        TryFrom::try_from(&bytes[index..index + TIMESTAMP_LENGTH])
            .expect("Failed to deserialize updated_at"),
    );

    TrackEvent {
        name,
        metadata,
        satellite_id,
        session_id,
        created_at,
        updated_at,
        version: None,
    }
}

pub fn serialize_bounded_analytic_key(key: &AnalyticKey) -> Cow<[u8]> {
    let mut buf = Vec::with_capacity(ANALYTIC_KEY_MAX_SIZE);

    buf.extend(key.collected_at.to_be_bytes());
    buf.extend(key_to_bytes(&key.key));

    Cow::Owned(buf)
}

pub fn deserialize_bounded_analytic_key(bytes: Cow<[u8]>) -> AnalyticKey {
    let mut index = 0;

    let collected_at = u64::from_be_bytes(
        TryFrom::try_from(&bytes[0..TIMESTAMP_LENGTH]).expect("Failed to deserialize collected_at"),
    );

    index += TIMESTAMP_LENGTH;

    let key = bytes_to_key(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_KEY_LENGTH])
            .expect("Failed to deserialize key"),
    );

    AnalyticKey { collected_at, key }
}

pub fn serialize_bounded_analytic_satellite_key(key: &AnalyticSatelliteKey) -> Cow<[u8]> {
    let mut buf = Vec::with_capacity(ANALYTIC_SATELLITE_KEY_MAX_SIZE);

    buf.extend(principal_to_bytes(&key.satellite_id));
    buf.extend(key.collected_at.to_be_bytes());
    buf.extend(key_to_bytes(&key.key));

    Cow::Owned(buf)
}

pub fn deserialize_bounded_analytic_satellite_key(bytes: Cow<[u8]>) -> AnalyticSatelliteKey {
    let mut index = 0;

    let satellite_id = bytes_to_principal(
        TryFrom::try_from(&bytes[0..SERIALIZED_PRINCIPAL_LENGTH])
            .expect("Failed to deserialize satellite_id"),
    );

    index += SERIALIZED_PRINCIPAL_LENGTH;

    let collected_at = u64::from_be_bytes(
        TryFrom::try_from(&bytes[index..index + TIMESTAMP_LENGTH])
            .expect("Failed to deserialize collected_at"),
    );

    index += TIMESTAMP_LENGTH;

    let key = bytes_to_key(
        TryFrom::try_from(&bytes[index..index + SERIALIZED_KEY_LENGTH])
            .expect("Failed to deserialize key"),
    );

    AnalyticSatelliteKey {
        satellite_id,
        collected_at,
        key,
    }
}
