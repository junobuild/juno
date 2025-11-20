use crate::serializers::types::DocDataBigInt;
use serde::de::{self, MapAccess, Visitor};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

impl fmt::Display for DocDataBigInt {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.value)
    }
}

impl Serialize for DocDataBigInt {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("DocDataBigInt", 1)?;
        state.serialize_field("__bigint__", &self.value.to_string())?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for DocDataBigInt {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_struct("DocDataBigInt", &["__bigint__"], DocDataBigIntVisitor)
    }
}

struct DocDataBigIntVisitor;

impl<'de> Visitor<'de> for DocDataBigIntVisitor {
    type Value = DocDataBigInt;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an object with a key __bigint__")
    }

    fn visit_map<V>(self, mut map: V) -> Result<DocDataBigInt, V::Error>
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
        let bigint_value = value_str
            .parse::<u64>()
            .map_err(|_| de::Error::custom("Invalid format for __bigint__"))?;
        Ok(DocDataBigInt {
            value: bigint_value,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{self};

    #[test]
    fn serialize_doc_data_bigint() {
        let data = DocDataBigInt {
            value: 12345678901234,
        };
        let s = serde_json::to_string(&data).expect("serialize");
        assert_eq!(s, r#"{"__bigint__":"12345678901234"}"#);
    }

    #[test]
    fn deserialize_doc_data_bigint() {
        let s = r#"{"__bigint__":"12345678901234"}"#;
        let data: DocDataBigInt = serde_json::from_str(s).expect("deserialize");
        assert_eq!(data.value, 12345678901234);
    }

    #[test]
    fn round_trip() {
        let original = DocDataBigInt { value: u64::MAX };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: DocDataBigInt = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }

    #[test]
    fn error_on_missing_field() {
        let err = serde_json::from_str::<DocDataBigInt>(r#"{}"#).unwrap_err();
        assert!(
            err.to_string().contains("missing field `__bigint__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_duplicate_field() {
        let s = r#"{"__bigint__":"123","__bigint__":"456"}"#;
        let err = serde_json::from_str::<DocDataBigInt>(s).unwrap_err();
        assert!(
            err.to_string().contains("duplicate field `__bigint__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_invalid_bigint_format() {
        let s = r#"{"__bigint__":"not-a-number"}"#;
        let err = serde_json::from_str::<DocDataBigInt>(s).unwrap_err();
        assert!(
            err.to_string().contains("Invalid format for __bigint__"),
            "got: {err}"
        );
    }

    #[test]
    fn test_display_implementation() {
        let data = DocDataBigInt {
            value: 12345678901234,
        };
        assert_eq!(format!("{}", data), "12345678901234");
    }
}
