use crate::ledger::types::cycles::CyclesTokens;

impl CyclesTokens {
    pub const fn from_e12s(e12s: u64) -> Self {
        Self { e12s }
    }

    pub const fn e12s(&self) -> u64 {
        self.e12s
    }
}

impl std::ops::Sub for CyclesTokens {
    type Output = Self;

    fn sub(self, other: Self) -> Self {
        Self::from_e12s(self.e12s() - other.e12s())
    }
}
