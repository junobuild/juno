use crate::serializers::types::JsonDataNat;
use serde::de::{self, MapAccess, Visitor};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

impl fmt::Display for JsonDataNat {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.value)
    }
}

impl Serialize for JsonDataNat {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("DocDataNat", 1)?;
        state.serialize_field("__bigint__", &self.value.to_string())?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for JsonDataNat {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_struct("DocDataNat", &["__bigint__"], DocDataNatVisitor)
    }
}

struct DocDataNatVisitor;

impl<'de> Visitor<'de> for DocDataNatVisitor {
    type Value = JsonDataNat;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an object with a key __bigint__")
    }

    fn visit_map<V>(self, mut map: V) -> Result<JsonDataNat, V::Error>
    where
        V: MapAccess<'de>,
    {
        let mut value = None;
        while let Some(key) = map.next_key::<String>()? {
            if key == "__bigint__" {
                if value.is_some() {
                    return Err(de::Error::duplicate_field("__bigint__"));
                }
                value = Some(map.next_value::<String>()?);
            }
        }
        let value_str = value.ok_or_else(|| de::Error::missing_field("__bigint__"))?;
        let nat_value = value_str
            .parse::<u128>()
            .map_err(|_| de::Error::custom("Invalid format for __bigint__"))?;
        Ok(JsonDataNat { value: nat_value })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json;

    #[test]
    fn serialize_doc_data_nat() {
        let data = JsonDataNat {
            value: 12345678901234,
        };
        let s = serde_json::to_string(&data).expect("serialize");
        assert_eq!(s, r#"{"__bigint__":"12345678901234"}"#);
    }

    #[test]
    fn deserialize_doc_data_nat() {
        let s = r#"{"__bigint__":"12345678901234"}"#;
        let data: JsonDataNat = serde_json::from_str(s).expect("deserialize");
        assert_eq!(data.value, 12345678901234);
    }

    #[test]
    fn round_trip() {
        let original = JsonDataNat { value: u128::MAX };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: JsonDataNat = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }

    #[test]
    fn error_on_missing_field() {
        let err = serde_json::from_str::<JsonDataNat>(r#"{}"#).unwrap_err();
        assert!(
            err.to_string().contains("missing field `__bigint__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_duplicate_field() {
        let s = r#"{"__bigint__":"123","__bigint__":"456"}"#;
        let err = serde_json::from_str::<JsonDataNat>(s).unwrap_err();
        assert!(
            err.to_string().contains("duplicate field `__bigint__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_invalid_nat_format() {
        let s = r#"{"__bigint__":"not-a-number"}"#;
        let err = serde_json::from_str::<JsonDataNat>(s).unwrap_err();
        assert!(
            err.to_string().contains("Invalid format for __bigint__"),
            "got: {err}"
        );
    }

    #[test]
    fn test_display_implementation() {
        let data = JsonDataNat {
            value: 12345678901234,
        };
        assert_eq!(format!("{}", data), "12345678901234");
    }
}
