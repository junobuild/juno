use crate::hooks::js::runtime::db::assert_delete_doc::AssertDeleteDoc;
use crate::hooks::js::runtime::db::assert_set_doc::AssertSetDoc;
use crate::hooks::js::runtime::db::on_delete_doc::OnDeleteDoc;
use crate::hooks::js::runtime::db::on_delete_filtered_docs::OnDeleteFilteredDocs;
use crate::hooks::js::runtime::db::on_delete_many_docs::OnDeleteManyDocs;
use crate::hooks::js::runtime::db::on_set_doc::OnSetDoc;
use crate::hooks::js::runtime::db::on_set_many_docs::OnSetManyDocs;
use crate::hooks::js::runtime::storage::assert_delete_asset::AssertDeleteAsset;
use crate::hooks::js::runtime::storage::assert_upload_asset::AssertUploadAsset;
use crate::hooks::js::runtime::storage::on_delete_asset::OnDeleteAsset;
use crate::hooks::js::runtime::storage::on_delete_filtered_assets::OnDeleteFilteredAssets;
use crate::hooks::js::runtime::storage::on_delete_many_assets::OnDeleteManyAssets;
use crate::hooks::js::runtime::storage::on_upload_asset::OnUploadAsset;
use crate::hooks::js::runtime::types::JsHook;
use crate::js::constants::HOOKS_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use rquickjs::{Ctx, Error as JsError};

pub fn execute_on_post_upgrade<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    evaluate_loaders(ctx)
}

fn evaluate_loaders<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    let loaders = [
        OnSetDoc.get_loader_code(),
        OnSetManyDocs.get_loader_code(),
        OnDeleteDoc.get_loader_code(),
        OnDeleteManyDocs.get_loader_code(),
        OnDeleteFilteredDocs.get_loader_code(),
        OnUploadAsset.get_loader_code(),
        OnDeleteAsset.get_loader_code(),
        OnDeleteManyAssets.get_loader_code(),
        OnDeleteFilteredAssets.get_loader_code(),
        AssertSetDoc.get_loader_code(),
        AssertDeleteDoc.get_loader_code(),
        AssertUploadAsset.get_loader_code(),
        AssertDeleteAsset.get_loader_code(),
    ];

    let loaders_code = loaders.join("\n");

    evaluate_module(ctx, HOOKS_MODULE_NAME, &loaders_code)
}
