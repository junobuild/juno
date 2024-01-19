use candid::Principal as CandidPrincipal;

pub struct Principal {
    pub value: CandidPrincipal,
}

pub struct BigInt {
    pub value: u64,
}
