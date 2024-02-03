use candid::Principal as CandidPrincipal;

pub struct DocDataPrincipal {
    pub value: CandidPrincipal,
}

pub struct DocDataBigInt {
    pub value: u64,
}
