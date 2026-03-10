use crate::serializers::types::JsonDataPrincipal;
use candid::Principal;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

pub fn serialize<S>(principal: &Option<Principal>, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match principal {
        Some(p) => JsonDataPrincipal { value: *p }.serialize(s),
        None => s.serialize_none(),
    }
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<Principal>, D::Error>
where
    D: Deserializer<'de>,
{
    Option::<JsonDataPrincipal>::deserialize(deserializer).map(|opt| opt.map(|d| d.value))
}

#[cfg(test)]
mod tests {
    use candid::Principal;
    use serde::{Deserialize, Serialize};
    use serde_json;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestStruct {
        #[serde(with = "super")]
        value: Option<Principal>,
    }

    fn p(txt: &str) -> Principal {
        Principal::from_text(txt).expect("principal text should parse")
    }

    #[test]
    fn serialize_some() {
        let s = TestStruct {
            value: Some(p("aaaaa-aa")),
        };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":{"__principal__":"aaaaa-aa"}}"#);
    }

    #[test]
    fn serialize_none() {
        let s = TestStruct { value: None };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":null}"#);
    }

    #[test]
    fn deserialize_some() {
        let json = r#"{"value":{"__principal__":"aaaaa-aa"}}"#;
        let s: TestStruct = serde_json::from_str(json).expect("deserialize");
        assert_eq!(s.value, Some(p("aaaaa-aa")));
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
            value: Some(p("ryjl3-tyaaa-aaaaa-aaaba-cai")),
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
