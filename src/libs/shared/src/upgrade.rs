use crate::types::memory::Memory;
use ic_stable_structures::writer::Writer;
use std::mem;
#[allow(unused)]
use ic_stable_structures::Memory as _;

pub fn write_pre_upgrade(state_bytes: &Vec<u8>, memory: &mut Memory) {
    // Write the length of the serialized bytes to memory, followed by the bytes themselves.
    let len = state_bytes.len() as u32;
    let mut writer = Writer::new(memory, 0);
    writer.write(&len.to_le_bytes()).unwrap();
    writer.write(state_bytes).unwrap()
}

pub fn read_post_upgrade(memory: &Memory) -> Vec<u8> {
    // The memory offset is 4 bytes because that's the length we used in pre_upgrade to store the length of the memory data for the upgrade.
    // https://github.com/dfinity/stable-structures/issues/104
    const OFFSET: usize = mem::size_of::<u32>();

    // Read the length of the state bytes.
    let mut state_len_bytes = [0; OFFSET];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    // Read the bytes.
    let mut state_bytes = vec![0; state_len];
    memory.read(u64::try_from(OFFSET).unwrap(), &mut state_bytes);

    state_bytes
}
