pub mod state {
    use crate::rules::types::rules::Rules;
    use crate::storage::types::assets::AssetHashes;
    use crate::storage::types::config::StorageConfig;
    use crate::storage::types::domain::CustomDomains;
    use crate::storage::types::store::{Asset, Batch, Chunk};
    use crate::types::core::Key;
    use candid::{CandidType, Deserialize};
    use std::collections::HashMap;

    pub type FullPath = Key;

    pub type Batches = HashMap<u128, Batch>;
    pub type Chunks = HashMap<u128, Chunk>;
    pub type Assets = HashMap<FullPath, Asset>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StorageHeapState {
        pub assets: Assets,
        pub rules: Rules,
        pub config: StorageConfig,
        pub custom_domains: CustomDomains,
    }

    #[derive(Default, Clone)]
    pub struct StorageRuntimeState {
        pub chunks: Chunks,
        pub batches: Batches,
        pub asset_hashes: AssetHashes,
    }
}

pub mod assets {
    use ic_certified_map::{Hash, RbTree};
    use std::clone::Clone;

    #[derive(Default, Clone)]
    pub struct AssetHashes {
        pub tree: RbTree<String, Hash>,
    }
}

pub mod store {
    use crate::storage::types::http::HeaderField;
    use crate::storage::types::state::FullPath;
    use crate::types::core::CollectionKey;
    use candid::CandidType;
    use ic_certified_map::Hash;
    use serde::Deserialize;
    use shared::types::state::UserId;
    use std::clone::Clone;
    use std::collections::HashMap;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Chunk {
        pub batch_id: u128,
        pub content: Vec<u8>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AssetEncoding {
        pub modified: u64,
        pub content_chunks: Vec<Vec<u8>>,
        pub total_length: u128,
        pub sha256: Hash,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AssetKey {
        // myimage.jpg
        pub name: String,
        // /images/myimage.jpg
        pub full_path: FullPath,
        // ?token=1223-3345-5564-3333
        pub token: Option<String>,
        // Assets are prefixed with full_path because these are unique. Collection is there for read (list) and write but all assets are available through http_request (that's why we use the token).
        pub collection: CollectionKey,
        // For security check purpose
        pub owner: UserId,
        // A description field which can be useful for search purpose
        pub description: Option<String>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Asset {
        pub key: AssetKey,
        pub headers: Vec<HeaderField>,
        pub encodings: HashMap<String, AssetEncoding>,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Batch {
        pub key: AssetKey,
        pub expires_at: u64,
        pub encoding_type: Option<String>,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use ic_certified_map::Hash;

    use crate::storage::types::http::HeaderField;
    use crate::storage::types::state::FullPath;
    use crate::storage::types::store::AssetKey;
    use crate::types::core::CollectionKey;

    #[derive(CandidType, Deserialize)]
    pub struct InitAssetKey {
        pub name: String,
        pub full_path: FullPath,
        pub token: Option<String>,
        pub collection: CollectionKey,
        pub encoding_type: Option<String>,
        pub description: Option<String>,
    }

    #[derive(CandidType)]
    pub struct InitUploadResult {
        pub batch_id: u128,
    }

    #[derive(CandidType, Deserialize)]
    pub struct UploadChunk {
        pub batch_id: u128,
        pub content: Vec<u8>,
        pub chunk_id: Option<u128>,
    }

    #[derive(CandidType)]
    pub struct UploadChunkResult {
        pub chunk_id: u128,
    }

    #[derive(CandidType, Deserialize)]
    pub struct CommitBatch {
        pub batch_id: u128,
        pub headers: Vec<HeaderField>,
        pub chunk_ids: Vec<u128>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AssetNoContent {
        pub key: AssetKey,
        pub headers: Vec<HeaderField>,
        pub encodings: Vec<(String, AssetEncodingNoContent)>,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AssetEncodingNoContent {
        pub modified: u64,
        pub total_length: u128,
        pub sha256: Hash,
    }
}

pub mod http {
    use candid::{CandidType, Deserialize, Func};
    use serde_bytes::ByteBuf;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct HeaderField(pub String, pub String);

    #[derive(CandidType, Deserialize, Clone)]
    pub struct HttpRequest {
        pub url: String,
        pub method: String,
        pub headers: Vec<HeaderField>,
        pub body: Vec<u8>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct HttpResponse {
        pub body: Vec<u8>,
        pub headers: Vec<HeaderField>,
        pub status_code: u16,
        pub streaming_strategy: Option<StreamingStrategy>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub enum StreamingStrategy {
        Callback {
            token: StreamingCallbackToken,
            callback: Func,
        },
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct StreamingCallbackToken {
        pub full_path: String,
        pub token: Option<String>,
        pub headers: Vec<HeaderField>,
        pub sha256: Option<ByteBuf>,
        pub index: usize,
        pub encoding_type: String,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct StreamingCallbackHttpResponse {
        pub body: Vec<u8>,
        pub token: Option<StreamingCallbackToken>,
    }
}

pub mod config {
    use crate::storage::types::http::HeaderField;
    use candid::{CandidType, Deserialize};
    use std::collections::HashMap;

    pub type StorageConfigHeaders = HashMap<String, Vec<HeaderField>>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StorageConfig {
        pub headers: StorageConfigHeaders,
    }
}

pub mod http_request {
    use crate::storage::types::store::Asset;
    use candid::{CandidType, Deserialize};

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MapUrl {
        pub path: String,
        pub token: Option<String>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct PublicAsset {
        pub url: String,
        pub asset: Option<Asset>,
    }
}

pub mod domain {
    use candid::{CandidType, Deserialize};
    use std::collections::HashMap;

    pub type DomainName = String;
    pub type CustomDomains = HashMap<DomainName, CustomDomain>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CustomDomain {
        pub bn_id: Option<String>,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
