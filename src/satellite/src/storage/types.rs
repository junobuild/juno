pub mod state {
    use crate::rules::types::rules::Rules;
    use crate::storage::certification::types::certified::CertifiedAssetHashes;
    use crate::storage::types::config::StorageConfig;
    use crate::storage::types::domain::CustomDomains;
    use crate::storage::types::store::{Asset, Batch, Chunk, EncodingType};
    use crate::types::core::{Blob, CollectionKey, Key};
    use crate::types::memory::Memory;
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type FullPath = Key;

    pub type Batches = HashMap<u128, Batch>;
    pub type Chunks = HashMap<u128, Chunk>;

    pub type AssetsStable = StableBTreeMap<StableKey, Asset, Memory>;
    pub type ContentChunksStable = StableBTreeMap<StableEncodingChunkKey, Blob, Memory>;

    pub type AssetsHeap = HashMap<FullPath, Asset>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct StableKey {
        pub collection: CollectionKey,
        pub full_path: FullPath,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct StableEncodingChunkKey {
        pub full_path: FullPath,
        pub encoding_type: EncodingType,
        pub chunk_index: usize,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageHeapState {
        pub assets: AssetsHeap,
        pub rules: Rules,
        pub config: StorageConfig,
        pub custom_domains: CustomDomains,
    }

    #[derive(Default, Clone)]
    pub struct StorageRuntimeState {
        pub chunks: Chunks,
        pub batches: Batches,
        pub asset_hashes: CertifiedAssetHashes,
    }
}

pub mod store {
    use crate::storage::http::types::HeaderField;
    use crate::storage::types::state::FullPath;
    use crate::types::core::{Blob, CollectionKey};
    use candid::CandidType;
    use ic_certification::Hash;
    use serde::{Deserialize, Serialize};
    use shared::types::state::UserId;
    use std::clone::Clone;
    use std::collections::HashMap;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Chunk {
        pub batch_id: u128,
        pub order_id: u128,
        pub content: Blob,
    }

    // When stable memory is used, chunks are saved within a StableBTreeMap and their keys - StableEncodingChunkKey - are saved for reference as serialized values
    pub type BlobOrKey = Blob;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AssetEncoding {
        pub modified: u64,
        pub content_chunks: Vec<BlobOrKey>,
        pub total_length: u128,
        pub sha256: Hash,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
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

    pub type EncodingType = String;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Asset {
        pub key: AssetKey,
        pub headers: Vec<HeaderField>,
        pub encodings: HashMap<EncodingType, AssetEncoding>,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Batch {
        pub key: AssetKey,
        pub expires_at: u64,
        pub encoding_type: Option<EncodingType>,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use ic_certification::Hash;

    use crate::storage::http::types::HeaderField;
    use crate::storage::types::state::FullPath;
    use crate::storage::types::store::{AssetKey, EncodingType};
    use crate::types::core::{Blob, CollectionKey};

    #[derive(CandidType, Deserialize)]
    pub struct InitAssetKey {
        pub name: String,
        pub full_path: FullPath,
        pub token: Option<String>,
        pub collection: CollectionKey,
        pub encoding_type: Option<EncodingType>,
        pub description: Option<String>,
    }

    #[derive(CandidType)]
    pub struct InitUploadResult {
        pub batch_id: u128,
    }

    #[derive(CandidType, Deserialize)]
    pub struct UploadChunk {
        pub batch_id: u128,
        pub content: Blob,
        pub order_id: Option<u128>,
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
        pub encodings: Vec<(EncodingType, AssetEncodingNoContent)>,
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

pub mod config {
    use crate::storage::http::types::{HeaderField, StatusCode};
    use candid::CandidType;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type StorageConfigHeaders = HashMap<String, Vec<HeaderField>>;
    pub type StorageConfigRewrites = HashMap<String, String>;
    pub type StorageConfigRedirects = HashMap<String, StorageConfigRedirect>;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum StorageConfigIFrame {
        Deny,
        SameOrigin,
        AllowAny,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageConfig {
        pub headers: StorageConfigHeaders,
        pub rewrites: StorageConfigRewrites,
        pub redirects: Option<StorageConfigRedirects>,
        pub iframe: Option<StorageConfigIFrame>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageConfigRedirect {
        pub location: String,
        pub status_code: StatusCode,
    }
}

pub mod http_request {
    use crate::rules::types::rules::Memory;
    use crate::storage::http::types::StatusCode;
    use crate::storage::types::config::{StorageConfigIFrame, StorageConfigRedirect};
    use crate::storage::types::store::Asset;
    use candid::{CandidType, Deserialize};

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MapUrl {
        pub path: String,
        pub token: Option<String>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub enum Routing {
        Default(RoutingDefault),
        Rewrite(RoutingRewrite),
        Redirect(RoutingRedirect),
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct RoutingDefault {
        pub url: String,
        pub asset: Option<(Asset, Memory)>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct RoutingRewrite {
        pub url: String,
        pub asset: Option<(Asset, Memory)>,
        pub source: String,
        pub status_code: StatusCode,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct RoutingRedirect {
        pub url: String,
        pub redirect: StorageConfigRedirect,
        pub iframe: StorageConfigIFrame,
    }
}

pub mod domain {
    use candid::CandidType;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type DomainName = String;
    pub type CustomDomains = HashMap<DomainName, CustomDomain>;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CustomDomain {
        pub bn_id: Option<String>,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
