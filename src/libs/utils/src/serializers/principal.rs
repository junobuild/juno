use crate::serializers::types::Principal;
use candid::Principal as CandidPrincipal;
use serde::de::{self, MapAccess, Visitor};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

impl Serialize for Principal {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("Principal", 1)?;
        state.serialize_field("__principal__", &self.value.to_string())?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for Principal {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_struct("Principal", &["__principal__"], PrincipalVisitor)
    }
}

struct PrincipalVisitor;

impl<'de> Visitor<'de> for PrincipalVisitor {
    type Value = Principal;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("an object with a key __principal__")
    }

    fn visit_map<V>(self, mut map: V) -> Result<Principal, V::Error>
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
        Ok(Principal { value: principal })
    }
}
