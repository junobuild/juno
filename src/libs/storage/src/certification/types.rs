pub mod certified {
    use ic_certification::{Hash, NestedTree, RbTree};
    use junobuild_shared::types::core::Blob;
    use std::clone::Clone;

    #[derive(Default, Clone)]
    pub struct CertifiedAssetHashes {
        pub tree_v1: RbTree<String, Hash>,
        pub tree_v2: NestedTree<Blob, Blob>,
    }
}
