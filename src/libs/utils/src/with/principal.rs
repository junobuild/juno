use crate::serializers::types::JsonDataPrincipal;
use candid::Principal;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

pub fn serialize<S>(principal: &Principal, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    JsonDataPrincipal { value: *principal }.serialize(s)
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<Principal, D::Error>
where
    D: Deserializer<'de>,
{
    JsonDataPrincipal::deserialize(deserializer).map(|d| d.value)
}

#[cfg(test)]
mod tests {
    use candid::Principal;
    use serde::{Deserialize, Serialize};
    use serde_json;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestStruct {
        #[serde(with = "super")]
        value: Principal,
    }

    fn p(txt: &str) -> Principal {
        Principal::from_text(txt).expect("principal text should parse")
    }

    #[test]
    fn serialize_principal() {
        let s = TestStruct {
            value: p("aaaaa-aa"),
        };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":{"__principal__":"aaaaa-aa"}}"#);
    }

    #[test]
    fn deserialize_principal() {
        let json = r#"{"value":{"__principal__":"aaaaa-aa"}}"#;
        let s: TestStruct = serde_json::from_str(json).expect("deserialize");
        assert_eq!(s.value, p("aaaaa-aa"));
    }

    #[test]
    fn round_trip() {
        let original = TestStruct {
            value: p("ryjl3-tyaaa-aaaaa-aaaba-cai"),
        };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }
}
