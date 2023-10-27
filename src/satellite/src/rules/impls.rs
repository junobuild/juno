use crate::rules::types::rules::{Memory, Rule};

impl Rule {
    pub fn mem(&self) -> Memory {
        self.memory.clone().unwrap_or(Memory::default())
    }
}
