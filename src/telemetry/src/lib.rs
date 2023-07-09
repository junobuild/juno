mod impls;
mod memory;
mod types;

use crate::memory::{get_memory_upgrades, init_stable_state, STATE};
use crate::types::memory::Memory;
use crate::types::state::{HeapState, State};
use ciborium::{from_reader, into_writer};
use ic_cdk::export::candid::{candid_method, export_service};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::writer::Writer;
use ic_stable_structures::Memory as _;

#[init]
fn init() {
    // TODO: save mission control ID

    let heap = HeapState {
        // controllers: init_controllers(&controllers),
        ..Default::default()
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: init_stable_state(),
            heap,
        };
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    // Serialize the state using CBOR.
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the satellite in pre_upgrade hook.");

    // Write the length of the serialized bytes to memory, followed by the by the bytes themselves.
    let len = state_bytes.len() as u32;
    let mut memory = get_memory_upgrades();
    let mut writer = Writer::new(&mut memory, 0);
    writer.write(&len.to_le_bytes()).unwrap();
    writer.write(&state_bytes).unwrap()
}

#[post_upgrade]
fn post_upgrade() {
    let memory: Memory = get_memory_upgrades();

    // Read the length of the state bytes.
    let mut state_len_bytes = [0; 4];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    // Read the bytes
    let mut state_bytes = vec![0; state_len];
    memory.read(4, &mut state_bytes);

    // Deserialize and set the state.
    let state = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the satellite in post_upgrade hook.");
    STATE.with(|s| *s.borrow_mut() = state);
}

///
/// Generate did files
///

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    export_service!();
    __export_service()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let dir = dir
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("src")
            .join("telemetry");
        write(dir.join("telemetry.did"), export_candid()).expect("Write failed.");
    }
}
