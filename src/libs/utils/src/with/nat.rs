use crate::serializers::types::JsonDataNat;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

pub fn serialize<S>(value: &u128, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    JsonDataNat { value: *value }.serialize(s)
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<u128, D::Error>
where
    D: Deserializer<'de>,
{
    JsonDataNat::deserialize(deserializer).map(|d| d.value)
}

#[cfg(test)]
mod tests {
    use serde::{Deserialize, Serialize};
    use serde_json;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestStruct {
        #[serde(with = "crate::with::nat")]
        value: u128,
    }

    #[test]
    fn serialize_nat() {
        let s = TestStruct { value: 42 };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":{"__bigint__":"42"}}"#);
    }

    #[test]
    fn deserialize_nat() {
        let json = r#"{"value":{"__bigint__":"42"}}"#;
        let s: TestStruct = serde_json::from_str(json).expect("deserialize");
        assert_eq!(s.value, 42);
    }

    #[test]
    fn round_trip() {
        let original = TestStruct { value: u128::MAX };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }
}
