use crate::serializers::types::JsonDataBigInt;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

pub fn serialize<S>(value: &Option<u64>, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match value {
        Some(v) => JsonDataBigInt { value: *v }.serialize(s),
        None => s.serialize_none(),
    }
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<u64>, D::Error>
where
    D: Deserializer<'de>,
{
    Option::<JsonDataBigInt>::deserialize(deserializer).map(|opt| opt.map(|d| d.value))
}

#[cfg(test)]
mod tests {
    use serde::{Deserialize, Serialize};
    use serde_json;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestStruct {
        #[serde(with = "super")]
        value: Option<u64>,
    }

    #[test]
    fn serialize_some() {
        let s = TestStruct { value: Some(42) };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":{"__bigint__":"42"}}"#);
    }

    #[test]
    fn serialize_none() {
        let s = TestStruct { value: None };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":null}"#);
    }

    #[test]
    fn deserialize_some() {
        let json = r#"{"value":{"__bigint__":"42"}}"#;
        let s: TestStruct = serde_json::from_str(json).expect("deserialize");
        assert_eq!(s.value, Some(42));
    }

    #[test]
    fn deserialize_none() {
        let json = r#"{"value":null}"#;
        let s: TestStruct = serde_json::from_str(json).expect("deserialize");
        assert_eq!(s.value, None);
    }

    #[test]
    fn round_trip_some() {
        let original = TestStruct {
            value: Some(u64::MAX),
        };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }

    #[test]
    fn round_trip_none() {
        let original = TestStruct { value: None };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }
}
