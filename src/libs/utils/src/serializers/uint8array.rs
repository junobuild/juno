use crate::serializers::types::DocDataUint8Array;
use serde::de::{self, MapAccess, Visitor};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

impl fmt::Display for DocDataUint8Array {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self.value)
    }
}

impl Serialize for DocDataUint8Array {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("DocDataUint8Array", 1)?;
        state.serialize_field("__uint8array__", &self.value)?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for DocDataUint8Array {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_struct(
            "DocDataUint8Array",
            &["__uint8array__"],
            DocDataUint8ArrayVisitor,
        )
    }
}

struct DocDataUint8ArrayVisitor;

impl<'de> Visitor<'de> for DocDataUint8ArrayVisitor {
    type Value = DocDataUint8Array;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an object with a key __uint8array__")
    }

    fn visit_map<V>(self, mut map: V) -> Result<DocDataUint8Array, V::Error>
    where
        V: MapAccess<'de>,
    {
        let mut value: Option<Vec<u8>> = None;

        while let Some(key) = map.next_key::<String>()? {
            if key == "__uint8array__" {
                if value.is_some() {
                    return Err(de::Error::duplicate_field("__uint8array__"));
                }
                value = Some(map.next_value::<Vec<u8>>()?);
            }
        }

        let bytes = value.ok_or_else(|| de::Error::missing_field("__uint8array__"))?;
        Ok(DocDataUint8Array { value: bytes })
    }
}
