pub mod certified {
    use crate::storage::certification::tree::NestedTree;
    use crate::types::core::Blob;
    use ic_certification::{Hash, RbTree};
    use std::clone::Clone;

    #[derive(Default, Clone)]
    pub struct CertifiedAssetHashes {
        pub tree_v1: RbTree<String, Hash>,
        pub tree_v2: NestedTree<Blob, Blob>,
    }
}
