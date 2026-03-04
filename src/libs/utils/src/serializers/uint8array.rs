use crate::serializers::types::JsonDataUint8Array;
use serde::de::{self, MapAccess, Visitor};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

impl fmt::Display for JsonDataUint8Array {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self.value)
    }
}

impl Serialize for JsonDataUint8Array {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("DocDataUint8Array", 1)?;
        state.serialize_field("__uint8array__", &self.value)?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for JsonDataUint8Array {
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
    type Value = JsonDataUint8Array;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an object with a key __uint8array__")
    }

    fn visit_map<V>(self, mut map: V) -> Result<JsonDataUint8Array, V::Error>
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
        Ok(JsonDataUint8Array { value: bytes })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{self};

    #[test]
    fn serialize_doc_data_uint8array() {
        let data = JsonDataUint8Array {
            value: vec![1, 2, 3, 5],
        };
        let s = serde_json::to_string(&data).expect("serialize");
        assert_eq!(s, r#"{"__uint8array__":[1,2,3,5]}"#);
    }

    #[test]
    fn deserialize_doc_data_uint8array() {
        let s = r#"{"__uint8array__":[1,2,3,5]}"#;
        let data: JsonDataUint8Array = serde_json::from_str(s).expect("deserialize");
        assert_eq!(data.value, vec![1, 2, 3, 5]);
    }

    #[test]
    fn round_trip() {
        let original = JsonDataUint8Array {
            value: vec![0, 1, 2, 3, 5],
        };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: JsonDataUint8Array = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }

    #[test]
    fn error_on_missing_field() {
        let err = serde_json::from_str::<JsonDataUint8Array>(r#"{}"#).unwrap_err();
        assert!(
            err.to_string().contains("missing field `__uint8array__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_duplicate_field() {
        let s = r#"{"__uint8array__":[1,2],"__uint8array__":[3,4]}"#;
        let err = serde_json::from_str::<JsonDataUint8Array>(s).unwrap_err();
        assert!(
            err.to_string().contains("duplicate field `__uint8array__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_invalid_uint8array_format() {
        let s = r#"{"__uint8array__":"not-a-uint8array"}"#;
        let err = serde_json::from_str::<JsonDataUint8Array>(s).unwrap_err();
        assert!(
            err.to_string()
                .contains("invalid type: string \"not-a-uint8array\""),
            "got: {err}"
        );
    }

    #[test]
    fn test_display_implementation() {
        let data = JsonDataUint8Array {
            value: vec![1, 2, 3],
        };
        assert_eq!(format!("{}", data), "[1, 2, 3]");
    }
}
