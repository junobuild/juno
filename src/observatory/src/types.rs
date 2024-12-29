pub mod state {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::Controllers;

    #[derive(Default, Clone)]
    pub struct State {
        pub heap: HeapState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct HeapState {
        pub controllers: Controllers,
    }
}
