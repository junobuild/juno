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
