use crate::serializers::types::DocDataUint8Array;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

pub fn serialize<S>(value: &Vec<u8>, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    DocDataUint8Array {
        value: value.clone(),
    }
    .serialize(s)
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<Vec<u8>, D::Error>
where
    D: Deserializer<'de>,
{
    DocDataUint8Array::deserialize(deserializer).map(|d| d.value)
}

#[cfg(test)]
mod tests {
    use serde::{Deserialize, Serialize};
    use serde_json;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestStruct {
        #[serde(with = "super")]
        value: Vec<u8>,
    }

    #[test]
    fn serialize_uint8array() {
        let s = TestStruct {
            value: vec![1, 2, 3],
        };
        let json = serde_json::to_string(&s).expect("serialize");
        assert_eq!(json, r#"{"value":{"__uint8array__":[1,2,3]}}"#);
    }

    #[test]
    fn deserialize_uint8array() {
        let json = r#"{"value":{"__uint8array__":[1,2,3]}}"#;
        let s: TestStruct = serde_json::from_str(json).expect("deserialize");
        assert_eq!(s.value, vec![1, 2, 3]);
    }

    #[test]
    fn round_trip() {
        let original = TestStruct {
            value: vec![0, 1, 2, 3, 255],
        };
        let json = serde_json::to_string(&original).unwrap();
        let decoded: TestStruct = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.value, original.value);
    }
}
