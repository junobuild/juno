pub mod state {
    use crate::types::config::StorageConfig;
    use crate::types::store::Asset;
    use candid::{CandidType, Deserialize};
    use junobuild_collections::types::rules::Rules;
    use junobuild_shared::types::core::Key;
    use junobuild_shared::types::domain::CustomDomains;
    use serde::Serialize;
    use std::collections::HashMap;

    /// Represents the relative path of an asset in the storage.
    ///
    /// This type, `FullPath`, is an alias for `Key`, indicating the relative path of an asset within the storage system.
    ///
    /// `FullPath` is commonly used to identify the location of assets within a storage system.
    pub type FullPath = Key;

    pub type AssetsHeap = HashMap<FullPath, Asset>;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageHeapState {
        pub assets: AssetsHeap,
        pub rules: Rules,
        pub config: StorageConfig,
        pub custom_domains: CustomDomains,
    }
}

pub mod runtime_state {
    use crate::certification::types::certified::CertifiedAssetHashes;
    use crate::types::store::{Batch, Chunk};
    use junobuild_shared::rate::types::RateTokenStore;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type Batches = HashMap<BatchId, Batch>;
    pub type Chunks = HashMap<ChunkId, Chunk>;

    pub type BatchId = u128;
    pub type ChunkId = u128;

    #[derive(Default, Serialize, Deserialize)]
    pub struct State {
        // Unstable state: State that resides only on the heap, that’s lost after an upgrade.
        #[serde(skip, default)]
        pub runtime: RuntimeState,
    }

    #[derive(Default, Clone)]
    pub struct RuntimeState {
        pub storage: StorageRuntimeState,
    }

    #[derive(Default, Clone)]
    pub struct StorageRuntimeState {
        pub batches: Batches,
        pub chunks: Chunks,
        pub asset_hashes: CertifiedAssetHashes,
        pub rate_tokens: RateTokenStore,
    }
}

pub mod store {
    use crate::http::types::HeaderField;
    use crate::types::interface::CommitBatch;
    use crate::types::runtime_state::BatchId;
    use crate::types::state::FullPath;
    use candid::CandidType;
    use ic_certification::Hash;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::core::Blob;
    use junobuild_shared::types::state::{Timestamp, UserId, Version};
    use serde::{Deserialize, Serialize};
    use std::clone::Clone;
    use std::collections::HashMap;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Chunk {
        pub batch_id: BatchId,
        pub order_id: u128,
        pub content: Blob,
    }

    // When stable memory is used, chunks are saved within a StableBTreeMap and their keys - StableEncodingChunkKey - are saved for reference as serialized values
    pub type BlobOrKey = Blob;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AssetEncoding {
        pub modified: Timestamp,
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
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    pub trait BatchExpiry {
        fn expires_at(&self) -> Timestamp;
    }

    pub type ReferenceId = u128;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Batch {
        pub key: AssetKey,
        pub reference_id: Option<ReferenceId>,
        pub expires_at: Timestamp,
        pub encoding_type: Option<EncodingType>,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct AssetAssertUpload {
        pub current: Option<Asset>,
        pub batch: Batch,
        pub commit_batch: CommitBatch,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use ic_certification::Hash;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::core::Blob;
    use junobuild_shared::types::state::{Timestamp, Version};
    use serde::Serialize;

    use crate::http::types::HeaderField;
    use crate::types::config::{
        StorageConfigHeaders, StorageConfigIFrame, StorageConfigMaxMemorySize,
        StorageConfigRawAccess, StorageConfigRedirects, StorageConfigRewrites,
    };
    use crate::types::runtime_state::{BatchId, ChunkId};
    use crate::types::state::FullPath;
    use crate::types::store::{AssetKey, EncodingType};

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
        pub batch_id: BatchId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct UploadChunk {
        pub batch_id: BatchId,
        pub content: Blob,
        pub order_id: Option<u128>,
    }

    #[derive(CandidType)]
    pub struct UploadChunkResult {
        pub chunk_id: ChunkId,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CommitBatch {
        pub batch_id: BatchId,
        pub headers: Vec<HeaderField>,
        pub chunk_ids: Vec<ChunkId>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AssetNoContent {
        pub key: AssetKey,
        pub headers: Vec<HeaderField>,
        pub encodings: Vec<(EncodingType, AssetEncodingNoContent)>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct AssetEncodingNoContent {
        pub modified: Timestamp,
        pub total_length: u128,
        pub sha256: Hash,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetStorageConfig {
        pub headers: StorageConfigHeaders,
        pub rewrites: StorageConfigRewrites,
        pub redirects: Option<StorageConfigRedirects>,
        pub iframe: Option<StorageConfigIFrame>,
        pub raw_access: Option<StorageConfigRawAccess>,
        pub max_memory_size: Option<StorageConfigMaxMemorySize>,
        pub version: Option<Version>,
    }
}

pub mod config {
    use crate::http::types::{HeaderField, StatusCode};
    use candid::CandidType;
    use junobuild_shared::types::config::ConfigMaxMemorySize;
    use junobuild_shared::types::state::{Timestamp, Version};
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

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum StorageConfigRawAccess {
        Deny,
        Allow,
    }

    pub type StorageConfigMaxMemorySize = ConfigMaxMemorySize;

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageConfig {
        pub headers: StorageConfigHeaders,
        pub rewrites: StorageConfigRewrites,
        pub redirects: Option<StorageConfigRedirects>,
        pub iframe: Option<StorageConfigIFrame>,
        pub raw_access: Option<StorageConfigRawAccess>,
        pub max_memory_size: Option<StorageConfigMaxMemorySize>,
        pub version: Option<Version>,
        pub created_at: Option<Timestamp>,
        pub updated_at: Option<Timestamp>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct StorageConfigRedirect {
        pub location: String,
        pub status_code: StatusCode,
    }
}

pub mod http_request {
    use crate::http::types::StatusCode;
    use crate::types::config::{StorageConfigIFrame, StorageConfigRedirect};
    use crate::types::store::Asset;
    use candid::{CandidType, Deserialize};
    use junobuild_collections::types::rules::Memory;

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
        RedirectRaw(RoutingRedirectRaw),
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

    #[derive(CandidType, Deserialize, Clone)]
    pub struct RoutingRedirectRaw {
        pub redirect_url: String,
        pub iframe: StorageConfigIFrame,
    }
}
