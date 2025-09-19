use crate::store::{mutate_heap_state, read_heap_state};
use crate::types::state::{HeapState, ReleaseVersion, ReleasesMetadata};
use semver::Version;
use std::collections::HashSet;

pub fn get_releases_metadata() -> ReleasesMetadata {
    read_heap_state(|heap| heap.releases_metadata.clone())
}

pub fn set_releases_metadata(metadata: &ReleasesMetadata) {
    mutate_heap_state(|heap| set_releases_metadata_impl(metadata, heap))
}

fn set_releases_metadata_impl(metadata: &ReleasesMetadata, heap_state: &mut HeapState) {
    heap_state.releases_metadata = metadata.clone();
}

pub fn get_latest_mission_control_version() -> Option<ReleaseVersion> {
    read_heap_state(|heap| get_latest_version(&heap.releases_metadata.mission_controls))
}

pub fn get_latest_orbiter_version() -> Option<ReleaseVersion> {
    read_heap_state(|heap| get_latest_version(&heap.releases_metadata.orbiters))
}

pub fn get_latest_satellite_version() -> Option<ReleaseVersion> {
    read_heap_state(|heap| get_latest_version(&heap.releases_metadata.satellites))
}

fn get_latest_version(versions: &HashSet<ReleaseVersion>) -> Option<ReleaseVersion> {
    versions
        .iter()
        .filter_map(|v| Version::parse(v).ok().map(|parsed| (parsed, v)))
        .max_by(|(parsed_a, _), (parsed_b, _)| parsed_a.cmp(parsed_b))
        .map(|(_, version)| version.clone())
}
