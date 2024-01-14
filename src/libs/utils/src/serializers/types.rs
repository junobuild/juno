pub struct BigInt {
    pub value: u64,
}

pub mod json {
    use candid::Principal as CandidPrincipal;

    pub struct Principal {
        pub value: CandidPrincipal,
    }
}
