use crate::types::memory::Memory;
use ciborium::{de::Error as CborError, from_reader};
use ic_stable_structures::writer::Writer;
#[allow(unused)]
use ic_stable_structures::{reader::Reader, Memory as _};
use std::io::{Error, ErrorKind, Read};
use std::mem;

pub fn write_pre_upgrade(state_bytes: &[u8], memory: &mut Memory) {
    // Write the length of the serialized bytes to memory, followed by the bytes themselves.
    let len = state_bytes.len() as u32;
    let mut writer = Writer::new(memory, 0);
    writer.write(&len.to_le_bytes()).unwrap();
    writer.write(state_bytes).unwrap()
}

pub fn read_post_upgrade<T: serde::de::DeserializeOwned>(
    memory: &Memory,
) -> Result<T, CborError<Error>> {
    // The memory offset is 4 bytes because that's the length we used in pre_upgrade to store the length of the memory data for the upgrade.
    // https://github.com/dfinity/stable-structures/issues/104
    const OFFSET: usize = mem::size_of::<u32>();

    // Read the length of the state bytes.
    let mut state_len_bytes = [0; OFFSET];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    let offset: u64 = OFFSET
        .try_into()
        .map_err(|_| Error::new(ErrorKind::InvalidData, "Invalid stable memory offset"))?;

    let len: u64 = state_len.try_into().map_err(|_| {
        Error::new(
            ErrorKind::InvalidData,
            "Invalid state length in stable memory",
        )
    })?;

    // Stream the bytes.
    let reader = Reader::new(memory, offset);
    let bounded_reader = reader.take(len);

    from_reader(bounded_reader)
}
