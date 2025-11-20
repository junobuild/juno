use crate::serializers::types::DocDataPrincipal;
use candid::Principal as CandidPrincipal;
use serde::de::{self, MapAccess, Visitor};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

impl Serialize for DocDataPrincipal {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("DocDataPrincipal", 1)?;
        state.serialize_field("__principal__", &self.value.to_string())?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for DocDataPrincipal {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_struct(
            "DocDataPrincipal",
            &["__principal__"],
            DocDataPrincipalVisitor,
        )
    }
}

struct DocDataPrincipalVisitor;

impl<'de> Visitor<'de> for DocDataPrincipalVisitor {
    type Value = DocDataPrincipal;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an object with a key __principal__")
    }

    fn visit_map<V>(self, mut map: V) -> Result<DocDataPrincipal, V::Error>
    where
        V: MapAccess<'de>,
    {
        let mut value = None;
        while let Some(key) = map.next_key::<String>()? {
            if key == "__principal__" {
                if value.is_some() {
                    return Err(de::Error::duplicate_field("__principal__"));
                }
                value = Some(map.next_value::<String>()?);
            }
        }
        let value_str = value.ok_or_else(|| de::Error::missing_field("__principal__"))?;
        let principal = CandidPrincipal::from_text(value_str)
            .map_err(|_| de::Error::custom("Invalid format for __principal__"))?;
        Ok(DocDataPrincipal { value: principal })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use candid::Principal as CandidPrincipal;
    use serde_json::{self};

    fn p(txt: &str) -> CandidPrincipal {
        CandidPrincipal::from_text(txt).expect("principal text should parse")
    }

    #[test]
    fn serialize_doc_data_principal() {
        let ddp = DocDataPrincipal {
            value: p("aaaaa-aa"),
        };
        let s = serde_json::to_string(&ddp).expect("serialize");
        assert_eq!(s, r#"{"__principal__":"aaaaa-aa"}"#);
    }

    #[test]
    fn deserialize_doc_data_principal() {
        let s = r#"{"__principal__":"aaaaa-aa"}"#;
        let ddp: DocDataPrincipal = serde_json::from_str(s).expect("deserialize");
        assert_eq!(ddp.value, p("aaaaa-aa"));
    }

    #[test]
    fn round_trip() {
        let original = DocDataPrincipal {
            value: p("ryjl3-tyaaa-aaaaa-aaaba-cai"),
        };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: DocDataPrincipal = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }

    #[test]
    fn error_on_missing_field() {
        let err = serde_json::from_str::<DocDataPrincipal>(r#"{}"#).unwrap_err();
        assert!(
            err.to_string().contains("missing field `__principal__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_duplicate_field() {
        let s = r#"{"__principal__":"aaaaa-aa","__principal__":"aaaaa-aa"}"#;
        let err = serde_json::from_str::<DocDataPrincipal>(s).unwrap_err();
        assert!(
            err.to_string().contains("duplicate field `__principal__`"),
            "got: {err}"
        );
    }

    #[test]
    fn error_on_invalid_principal_format() {
        let s = r#"{"__principal__":"not-a-principal"}"#;
        let err = serde_json::from_str::<DocDataPrincipal>(s).unwrap_err();
        assert!(
            err.to_string().contains("Invalid format for __principal__"),
            "got: {err}"
        );
    }
}
