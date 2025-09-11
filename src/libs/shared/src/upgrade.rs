use crate::types::memory::Memory;
use ciborium::{de::Error as CborError, from_reader, into_writer};
#[allow(unused)]
use ic_stable_structures::{reader::Reader, writer::Writer, Memory as _};
use std::io::{Error, ErrorKind, Read, Write};
use std::mem::size_of;

// The memory offset is 4 bytes because that's the length we used in pre_upgrade to store the length of the memory data for the upgrade.
// https://github.com/dfinity/stable-structures/issues/104
const OFFSET: usize = size_of::<u32>();

fn offset() -> Result<u64, Error> {
    OFFSET
        .try_into()
        .map_err(|_| Error::new(ErrorKind::InvalidData, "Invalid stable memory offset"))
}

// A custom writer that writes to memory while also counting the number of bytes written.
// The total is later stored in the 4-byte length prefix in stable memory.
struct PreUpgradeWriter<W> {
    inner: W,
    bytes_length: usize,
}

impl<W: Write> Write for PreUpgradeWriter<W> {
    fn write(&mut self, buf: &[u8]) -> Result<usize, Error> {
        let m = self.inner.write(buf)?;
        self.bytes_length += m;
        Ok(m)
    }

    fn flush(&mut self) -> Result<(), Error> {
        self.inner.flush()
    }
}

pub fn write_pre_upgrade<T: serde::Serialize>(state: &T, memory: &mut Memory) -> Result<(), Error> {
    // Reserve 4 bytes for the length prefix of the serialized bytes that will be saved
    let mut header = Writer::new(memory, 0);
    header.write_all(&[0u8; OFFSET])?;

    // Write (stream) the state bytes to memory starting at OFFSET
    // while counting the number of bytes written
    let payload = Writer::new(memory, offset()?);
    let mut writer = PreUpgradeWriter {
        inner: payload,
        bytes_length: 0,
    };
    into_writer(state, &mut writer).map_err(|e| Error::new(ErrorKind::Other, e.to_string()))?;

    // Backfill (save) the length prefix with the number of bytes effectively written
    let len: u32 = writer.bytes_length.try_into().map_err(|_| {
        Error::new(
            ErrorKind::InvalidData,
            "Serialized state exceeds u32 length prefix",
        )
    })?;
    let mut header = Writer::new(memory, 0);
    header.write_all(&len.to_le_bytes())?;

    Ok(())
}

pub fn read_post_upgrade<T: serde::de::DeserializeOwned>(
    memory: &Memory,
) -> Result<T, CborError<Error>> {
    // Read the length of the state bytes
    let mut state_len_bytes = [0; OFFSET];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    let len: u64 = state_len.try_into().map_err(|_| {
        Error::new(
            ErrorKind::InvalidData,
            "Invalid state length in stable memory",
        )
    })?;

    // Read (stream) the bytes
    let reader = Reader::new(memory, offset()?);
    let bounded_reader = reader.take(len);

    from_reader(bounded_reader)
}
