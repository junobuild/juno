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
