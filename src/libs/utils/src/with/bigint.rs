use crate::serializers::types::JsonDataBigInt;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

pub fn serialize<S>(value: &u64, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    JsonDataBigInt { value: *value }.serialize(s)
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<u64, D::Error>
where
    D: Deserializer<'de>,
{
    JsonDataBigInt::deserialize(deserializer).map(|d| d.value)
}

#[cfg(test)]
mod tests {
    use serde::{Deserialize, Serialize};
    use serde_json;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestStruct {
        #[serde(with = "crate::with::bigint")]
        value: u64,
    }

    #[test]
    fn serialize_bigint() {
        let s = TestStruct { value: 42 };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":{"__bigint__":"42"}}"#);
    }

    #[test]
    fn deserialize_bigint() {
        let json = r#"{"value":{"__bigint__":"42"}}"#;
        let s: TestStruct = serde_json::from_str(json).expect("deserialize");
        assert_eq!(s.value, 42);
    }

    #[test]
    fn round_trip() {
        let original = TestStruct { value: u64::MAX };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }
}
