#![doc = include_str!("../README.md")]

extern crate proc_macro;

#[doc(hidden)]
mod error;
#[doc(hidden)]
mod parser;

use parser::{hook_macro, Hook};
use proc_macro::TokenStream;

/// The `on_set_doc` function is a procedural macro attribute for hooking into the `OnSetDoc` event.
/// It allows you to define custom logic to be executed when a document is set.
///
/// Example:
///
/// ```rust
/// #[on_set_doc]
/// async fn on_set_doc(context: OnSetDocContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// When no attributes are provided, the hook is triggered for any document set within any collection.
/// You can scope the events to a particular list of collections.
///
/// Example:
/// ```rust
/// #[on_set_doc(collections = ["demo"])]
/// async fn on_set_doc(context: OnSetDocContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
#[proc_macro_attribute]
pub fn on_set_doc(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnSetDoc, attr, item)
}

/// The `on_set_many_docs` function is a procedural macro attribute for hooking into the `OnSetManyDocs` event.
/// It allows you to define custom logic to be executed when multiple documents are set.
///
/// Example:
///
/// ```rust
/// #[on_set_many_docs]
/// async fn on_set_many_docs(context: OnSetManyDocsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// When no attributes are provided, the hook is triggered for any document set within any collection.
/// You can scope the events to a particular list of collections.
///
/// Example:
/// ```rust
/// #[on_set_many_docs(collections = ["demo"])]
/// async fn on_set_many_docs(context: OnSetManyDocsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
#[proc_macro_attribute]
pub fn on_set_many_docs(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnSetManyDocs, attr, item)
}

/// The `on_delete_doc` function is a procedural macro attribute for hooking into the `OnDeleteDoc` event.
/// It allows you to define custom logic to be executed when a document is deleted.
///
/// Example:
///
/// ```rust
/// #[on_delete_doc]
/// async fn on_delete_doc(context: OnDeleteDocContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// When no attributes are provided, the hook is triggered for any document set within any collection.
/// You can scope the events to a particular list of collections.
///
/// Example:
/// ```rust
/// #[on_delete_doc(collections = ["demo"])]
/// async fn on_delete_doc(context: OnDeleteDocContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
#[proc_macro_attribute]
pub fn on_delete_doc(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnDeleteDoc, attr, item)
}

/// The `on_delete_many_docs` function is a procedural macro attribute for hooking into the `OnDeleteManyDocs` event.
/// It allows you to define custom logic to be executed when multiple documents are deleted.
///
/// Example:
///
/// ```rust
/// #[on_delete_many_docs]
/// async fn on_delete_many_docs(context: OnDeleteManyDocsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// When no attributes are provided, the hook is triggered for any document set within any collection.
/// You can scope the events to a particular list of collections.
///
/// Example:
/// ```rust
/// #[on_delete_many_docs(collections = ["demo"])]
/// async fn on_delete_many_docs(context: OnDeleteManyDocsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
#[proc_macro_attribute]
pub fn on_delete_many_docs(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnDeleteManyDocs, attr, item)
}

/// The `on_delete_filtered_docs` function is a procedural macro attribute for hooking into the `OnDeleteFilteredDocs` event.
/// It allows you to define custom logic to be executed when documents are deleted based on specific filter criteria.
///
/// Example:
///
/// ```rust
/// #[on_delete_filtered_docs]
/// async fn on_delete_filtered_docs(context: OnDeleteFilteredDocsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// You can scope the events to a particular list of collections, making the hook more selective.
///
/// Example:
/// ```rust
/// #[on_delete_filtered_docs(collections = ["demo"])]
/// async fn on_delete_filtered_docs(context: OnDeleteFilteredDocsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
/// # Parameters
/// - `collections`: An optional list of collections to limit the scope of the hook.
/// - `context`: An instance of `OnDeleteFilteredDocsContext` containing information about the deletion event.
///
/// # Returns
/// - `Ok(())`: Indicates successful execution of the hook logic.
/// - `Err(String)`: An error message if the hook logic encounters issues.
///
#[proc_macro_attribute]
pub fn on_delete_filtered_docs(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnDeleteFilteredDocs, attr, item)
}

/// The `on_upload_asset` function is a procedural macro attribute for hooking into the `OnUploadAsset` event.
/// It allows you to define custom logic to be executed when an asset is uploaded.
///
/// Example:
///
/// ```rust
/// #[on_upload_asset]
/// async fn on_upload_asset(context: OnUploadAssetContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// When no attributes are provided, the hook is triggered for any asset upload within any collection.
/// You can scope the events to a particular list of collections.
///
/// Example:
/// ```rust
/// #[on_upload_asset(collections = ["demo"])]
/// async fn on_upload_asset(context: OnUploadAssetContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
#[proc_macro_attribute]
pub fn on_upload_asset(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnUploadAsset, attr, item)
}

/// The `on_delete_asset` function is a procedural macro attribute for hooking into the `OnDeleteAsset` event.
/// It allows you to define custom logic to be executed when an asset is deleted.
///
/// Example:
///
/// ```rust
/// #[on_delete_asset]
/// async fn on_delete_asset(context: OnDeleteAssetContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// When no attributes are provided, the hook is triggered for any asset deletion within any collection.
/// You can scope the events to a particular list of collections.
///
/// Example:
/// ```rust
/// #[on_delete_asset(collections = ["demo"])]
/// async fn on_delete_asset(context: OnDeleteAssetContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
#[proc_macro_attribute]
pub fn on_delete_asset(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnDeleteAsset, attr, item)
}

/// The `on_delete_many_assets` function is a procedural macro attribute for hooking into the `OnDeleteManyAssets` event.
/// It allows you to define custom logic to be executed when multiple assets are deleted.
///
/// Example:
///
/// ```rust
/// #[on_delete_many_assets]
/// async fn on_delete_many_assets(context: OnDeleteManyAssetsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// When no attributes are provided, the hook is triggered for any asset deletion within any collection.
/// You can scope the events to a particular list of collections.
///
/// Example:
/// ```rust
/// #[on_delete_many_assets(collections = ["demo"])]
/// async fn on_delete_many_assets(context: OnDeleteManyAssetsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
#[proc_macro_attribute]
pub fn on_delete_many_assets(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnDeleteManyAssets, attr, item)
}

/// The `on_delete_filtered_assets` function is a procedural macro attribute for hooking into the `OnDeleteFilteredAssets` event.
/// It allows you to define custom logic to be executed when assets are deleted based on specific filter criteria.
///
/// Example:
///
/// ```rust
/// #[on_delete_filtered_assets]
/// async fn on_delete_filtered_assets(context: OnDeleteFilteredAssetsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// You can scope the events to a particular list of collections, making the hook more selective.
///
/// Example:
/// ```rust
/// #[on_delete_filtered_assets(collections = ["assets_collection"])]
/// async fn on_delete_filtered_assets(context: OnDeleteFilteredAssetsContext) -> Result<(), String> {
///     // Your hook logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the hook will never be called.
///
/// # Parameters
/// - `collections`: An optional list of collections to limit the scope of the hook.
/// - `context`: An instance of `OnDeleteFilteredAssetsContext` containing information about the deletion event.
///
/// # Returns
/// - `Ok(())`: Indicates successful execution of the hook logic.
/// - `Err(String)`: An error message if the hook logic encounters issues.
///
#[proc_macro_attribute]
pub fn on_delete_filtered_assets(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnDeleteFilteredAssets, attr, item)
}

/// The `assert_set_doc` function is a procedural macro attribute for asserting conditions before setting a document.
/// It enables you to define custom validation logic to be executed prior to a document creation or update.
///
/// Example:
///
/// ```rust
/// #[assert_set_doc]
/// fn assert_set_doc(context: AssertSetDocContext) -> Result<(), String> {
///     // Your assertion logic here
/// }
/// ```
///
/// When no attributes are provided, the assertion logic is applied to any document set within any collection.
/// You can scope the assertion to a particular list of collections.
///
/// Example:
/// ```rust
/// #[assert_set_doc(collections = ["demo"])]
/// fn assert_set_doc(context: AssertSetDocContext) -> Result<(), String> {
///     // Your assertion logic here
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the assertion will always be evaluated.
///
#[proc_macro_attribute]
pub fn assert_set_doc(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::AssertSetDoc, attr, item)
}

/// The `assert_delete_doc` function is a procedural macro attribute for asserting conditions before deleting a document.
/// It enables you to define custom validation logic to be executed prior to a document deletion.
///
/// Example:
///
/// ```rust
/// #[assert_delete_doc]
/// fn assert_delete_doc(context: AssertDeleteDocContext) -> Result<(), String> {
///     // Your assertion logic here
/// }
/// ```
///
/// When no attributes are provided, the assertion logic is applied to any document delete within any collection.
/// You can scope the assertion to a particular list of collections.
///
/// Example:
/// ```rust
/// #[assert_delete_doc(collections = ["demo"])]
/// fn assert_delete_doc(context: AssertDeleteDocContext) -> Result<(), String> {
///     // Your assertion logic here, specific to the "demo" collection
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the assertion will always be evaluated.
///
#[proc_macro_attribute]
pub fn assert_delete_doc(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::AssertDeleteDoc, attr, item)
}

/// The `assert_upload_asset` function is a procedural macro attribute for asserting conditions before committing the upload of an asset.
/// It enables you to define custom validation logic to be executed prior to an asset being committed.
///
/// Example:
///
/// ```rust
/// #[assert_upload_asset]
/// fn assert_upload_asset(context: AssertUploadAssetContext) -> Result<(), String> {
///     // Your assertion logic here
/// }
/// ```
///
/// When no attributes are provided, the assertion logic is applied to any asset upload within any collection.
/// You can scope the assertion to a particular list of collections.
///
/// Example:
/// ```rust
/// #[assert_upload_asset(collections = ["assets"])]
/// fn juno_assert_upload_asset(context: AssertUploadAssetContext) -> Result<(), String> {
///     // Your assertion logic here, specific to the "assets" collection
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the assertion will always be evaluated.
///
#[proc_macro_attribute]
pub fn assert_upload_asset(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::AssertUploadAsset, attr, item)
}

/// The `assert_delete_asset` function is a procedural macro attribute for asserting conditions before deleting an asset.
/// It enables you to define custom validation logic to be executed prior to an asset being deleted.
///
/// Example:
///
/// ```rust
/// #[assert_delete_asset]
/// fn assert_delete_asset(context: AssertDeleteAssetContext) -> Result<(), String> {
///     // Your assertion logic here
/// }
/// ```
///
/// When no attributes are provided, the assertion logic is applied to any asset deletion within any collection.
/// You can scope the assertion to a particular list of collections.
///
/// Example:
/// ```rust
/// #[assert_delete_asset(collections = ["assets"])]
/// fn juno_assert_delete_asset(context: AssertDeleteAssetContext) -> Result<(), String> {
///     // Your assertion logic here, specific to the "assets" collection
/// }
/// ```
///
/// The attributes accept a list of comma-separated collections. If the attribute array is left empty, the assertion will always be evaluated.
///
#[proc_macro_attribute]
pub fn assert_delete_asset(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::AssertDeleteAsset, attr, item)
}

/// The `on_post_upgrade` function is a procedural macro attribute for hooking into the `OnPostUpgrade` event.
/// It allows you to define custom logic to be executed after a satellite upgrade.
///
/// Example:
///
/// ```rust
/// #[on_post_upgrade]
/// fn on_post_upgrade() {
///     // Your post-upgrade logic here
/// }
/// ```
///
#[proc_macro_attribute]
pub fn on_post_upgrade(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnPostUpgrade, attr, item)
}

/// The `on_init` function is a procedural macro attribute for hooking into the `OnInit` event.
/// It allows you to define custom logic to be executed after a satellite is initialized.
///
/// Example:
///
/// ```rust
/// #[on_init]
/// fn on_init() {
///     // Your post-init logic here
/// }
/// ```
///
#[proc_macro_attribute]
pub fn on_init(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnInit, attr, item)
}

/// The `on_post_upgrade_sync` function is a procedural macro attribute for hooking into the `OnPostUpgrade` event.
/// Unlike `on_post_upgrade`, this variant **executes synchronously** and is intended for advanced use cases
/// where immediate execution is required.
///
/// This macro should only be used in scenarios where deferred execution (via async hooks) is **not an option**.
/// Regular users should use `#[on_post_upgrade]` instead.
///
/// # Warning ⚠️
/// - This function **executes immediately** during a satellite upgrade.
/// - It **bypasses** the usual async execution model, which may lead to **unexpected behavior** if used improperly.
/// - Any error in this function will cause the upgrade to fail!!!
/// - If the upgrade fails, the satellite might become unresponsive and lose its data.
/// - **Developers should prefer `on_post_upgrade` unless they explicitly need synchronous behavior.**
///
/// Furthermore, note that the random number generator or other capabilities might not have been initialized at this point.
///
/// # Example (Restricted Usage)
///
/// ```rust
/// #[on_post_upgrade_sync]
/// fn on_post_upgrade_sync() {
///     // Perform necessary actions immediately on upgrade
/// }
/// ```
///
/// **Note:** This function is hidden from public documentation to discourage general usage.
#[doc(hidden)]
#[proc_macro_attribute]
pub fn on_post_upgrade_sync(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnPostUpgradeSync, attr, item)
}

/// The `on_init_sync` function is a procedural macro attribute for hooking into the `OnInit` event.
/// It serves the same purpose as `on_init`, but **executes synchronously**, ensuring that initialization
/// logic is run **immediately** instead of being deferred.
///
/// This function is intended for **special cases only** where an immediate initialization
/// step is necessary before any asynchronous tasks are triggered.
///
/// # Warning ⚠️
/// - This function **runs immediately** at initialization time.
/// - It **bypasses deferred execution**, meaning long-running operations **may slow down startup**.
/// - Regular users **should use `on_init` instead**, unless there's a strict requirement for synchronous behavior.
///
/// Furthermore, note that the random number generator or other capabilities might not have been initialized at this point.
///
/// # Example (Restricted Usage)
///
/// ```rust
/// #[on_init_sync]
/// fn on_init_sync() {
///     // This runs synchronously before any async operations are triggered
/// }
/// ```
///
/// **Note:** This function is hidden from public documentation to prevent unintended usage.
#[doc(hidden)]
#[proc_macro_attribute]
pub fn on_init_sync(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnInitSync, attr, item)
}

/// The `on_init_random_seed` function is a procedural macro attribute for hooking into the
/// `OnInitRandomSeed` event. It allows you to define custom logic to be executed after
/// the satellite has initialized the random seed.
///
/// Example:
///
/// ```rust
/// #[on_init_random_seed]
/// fn on_init_random_seed() {
///     // Your post-initialization logic after random seed setup
/// }
/// ```
///
#[proc_macro_attribute]
pub fn on_init_random_seed(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnInitRandomSeed, attr, item)
}
