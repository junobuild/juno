use crate::error::MacroError;
use proc_macro::TokenStream;
use proc_macro2::Ident;
use quote::quote;
use serde::Deserialize;
use serde_tokenstream::from_tokenstream;
use std::string::ToString;
use syn::{parse, ItemFn, ReturnType, Signature, Type};

#[derive(Default, Deserialize)]
struct HookAttributes {
    collections: Option<Vec<String>>,
}

#[allow(clippy::enum_variant_names)]
#[derive(Clone)]
pub enum Hook {
    OnSetDoc,
    OnSetManyDocs,
    OnDeleteDoc,
    OnDeleteManyDocs,
    OnDeleteFilteredDocs,
    OnUploadAsset,
    OnDeleteAsset,
    OnDeleteManyAssets,
    OnDeleteFilteredAssets,
    OnInit,
    OnInitSync,
    OnPostUpgrade,
    OnPostUpgradeSync,
    AssertSetDoc,
    AssertDeleteDoc,
    AssertUploadAsset,
    AssertDeleteAsset,
}

const CONTEXT_PARAM: &str = "context";

fn map_hook_name(hook: Hook) -> String {
    match hook {
        Hook::OnSetDoc => "juno_on_set_doc".to_string(),
        Hook::OnSetManyDocs => "juno_on_set_many_docs".to_string(),
        Hook::OnDeleteDoc => "juno_on_delete_doc".to_string(),
        Hook::OnDeleteManyDocs => "juno_on_delete_many_docs".to_string(),
        Hook::OnDeleteFilteredDocs => "juno_on_delete_filtered_docs".to_string(),
        Hook::OnUploadAsset => "juno_on_upload_asset".to_string(),
        Hook::OnDeleteAsset => "juno_on_delete_asset".to_string(),
        Hook::OnDeleteManyAssets => "juno_on_delete_many_assets".to_string(),
        Hook::OnDeleteFilteredAssets => "juno_on_delete_filtered_assets".to_string(),
        Hook::OnInit => "juno_on_init".to_string(),
        Hook::OnPostUpgrade => "juno_on_post_upgrade".to_string(),
        Hook::OnInitSync => "juno_on_init_sync".to_string(),
        Hook::OnPostUpgradeSync => "juno_on_post_upgrade_sync".to_string(),
        Hook::AssertSetDoc => "juno_assert_set_doc".to_string(),
        Hook::AssertDeleteDoc => "juno_assert_delete_doc".to_string(),
        Hook::AssertUploadAsset => "juno_assert_upload_asset".to_string(),
        Hook::AssertDeleteAsset => "juno_assert_delete_asset".to_string(),
    }
}

fn map_hook_collections(hook: Hook) -> Option<String> {
    match hook {
        Hook::OnSetDoc => Some("juno_on_set_doc_collections".to_string()),
        Hook::OnSetManyDocs => Some("juno_on_set_many_docs_collections".to_string()),
        Hook::OnDeleteDoc => Some("juno_on_delete_doc_collections".to_string()),
        Hook::OnDeleteManyDocs => Some("juno_on_delete_many_docs_collections".to_string()),
        Hook::OnDeleteFilteredDocs => Some("juno_on_delete_filtered_docs_collections".to_string()),
        Hook::OnUploadAsset => Some("juno_on_upload_asset_collections".to_string()),
        Hook::OnDeleteAsset => Some("juno_on_delete_asset_collections".to_string()),
        Hook::OnDeleteManyAssets => Some("juno_on_delete_many_assets_collections".to_string()),
        Hook::OnDeleteFilteredAssets => {
            Some("juno_on_delete_filtered_assets_collections".to_string())
        }
        Hook::AssertSetDoc => Some("juno_assert_set_doc_collections".to_string()),
        Hook::AssertDeleteDoc => Some("juno_assert_delete_doc_collections".to_string()),
        Hook::AssertUploadAsset => Some("juno_assert_upload_asset_collections".to_string()),
        Hook::AssertDeleteAsset => Some("juno_assert_delete_asset_collections".to_string()),
        _ => None,
    }
}

fn map_hook_type(hook: &Hook) -> Option<String> {
    match hook {
        Hook::OnSetDoc => Some("OnSetDocContext".to_string()),
        Hook::OnSetManyDocs => Some("OnSetManyDocsContext".to_string()),
        Hook::OnDeleteDoc => Some("OnDeleteDocContext".to_string()),
        Hook::OnDeleteManyDocs => Some("OnDeleteManyDocsContext".to_string()),
        Hook::OnDeleteFilteredDocs => Some("OnDeleteFilteredDocsContext".to_string()),
        Hook::OnUploadAsset => Some("OnUploadAssetContext".to_string()),
        Hook::OnDeleteAsset => Some("OnDeleteAssetContext".to_string()),
        Hook::OnDeleteManyAssets => Some("OnDeleteManyAssetsContext".to_string()),
        Hook::OnDeleteFilteredAssets => Some("OnDeleteFilteredAssetsContext".to_string()),
        Hook::AssertSetDoc => Some("AssertSetDocContext".to_string()),
        Hook::AssertDeleteDoc => Some("AssertDeleteDocContext".to_string()),
        Hook::AssertUploadAsset => Some("AssertUploadAssetContext".to_string()),
        Hook::AssertDeleteAsset => Some("AssertDeleteAssetContext".to_string()),
        _ => None,
    }
}

pub fn hook_macro(hook: Hook, attr: TokenStream, item: TokenStream) -> TokenStream {
    parse_hook(&hook, attr, item).map_or_else(|e| e.to_error(), Into::into)
}

fn parse_hook(hook: &Hook, attr: TokenStream, item: TokenStream) -> Result<TokenStream, String> {
    let ast = parse::<ItemFn>(item).map_err(|_| "Expected a function to register the hooks")?;

    let signature = &ast.sig;

    let hook_fn = Ident::new(&map_hook_name(hook.clone()), proc_macro2::Span::call_site());

    match hook {
        Hook::OnPostUpgrade | Hook::OnInit => {
            parse_lifecycle_hook(&ast, signature, &hook_fn)
        }
        Hook::OnPostUpgradeSync | Hook::OnInitSync => {
            parse_lifecycle_sync_hook(&ast, signature, &hook_fn)
        }
        _ => parse_doc_hook(&ast, signature, &hook_fn, hook, attr),
    }
}

fn parse_doc_hook(
    ast: &ItemFn,
    signature: &Signature,
    hook_fn: &Ident,
    hook: &Hook,
    attr: TokenStream,
) -> Result<TokenStream, String> {
    let hook_collections_fn = match &map_hook_collections(hook.clone()) {
        Some(hook_collections) => Ident::new(hook_collections, proc_macro2::Span::call_site()),
        None => return Err("Hook collection function cannot be None.".to_string()),
    };

    let hook_param = Ident::new(CONTEXT_PARAM, proc_macro2::Span::call_site());

    let hook_param_type = match &map_hook_type(hook) {
        Some(hook_type) => Ident::new(hook_type, proc_macro2::Span::call_site()),
        None => return Err("Hook type cannot be None.".to_string()),
    };

    let converted_attr: proc_macro2::TokenStream = attr.into();
    let attrs = from_tokenstream::<HookAttributes>(&converted_attr)
        .map_err(|_| "Expected valid attributes to register the hooks")?;

    let collections_tokens = if let Some(collections) = attrs.collections {
        let tokens = collections.iter().map(|col| quote! { #col.to_string() });
        quote! { Some(vec![#(#tokens,)*]) }
    } else {
        quote! { None }
    };

    let hook_body = match hook {
        Hook::AssertSetDoc
        | Hook::AssertDeleteDoc
        | Hook::AssertUploadAsset
        | Hook::AssertDeleteAsset => {
            parse_assert_hook(signature, hook_fn, &hook_param, &hook_param_type)
        }
        _ => parse_on_hook(signature, hook_fn, &hook_param, &hook_param_type),
    };

    let result = quote! {
        #ast

        #[no_mangle]
        pub extern "Rust" fn #hook_collections_fn() -> Option<Vec<String>> {
            #collections_tokens
        }

        #hook_body
    };

    Ok(result.into())
}

fn parse_on_hook(
    signature: &Signature,
    hook_fn: &Ident,
    hook_param: &Ident,
    hook_param_type: &Ident,
) -> proc_macro2::TokenStream {
    let func_name = &signature.ident;
    let is_async = signature.asyncness.is_some();

    let hook_return = parse_hook_return(signature);

    let function_call = if is_async {
        quote! { #func_name(#hook_param).await }
    } else {
        quote! { #func_name(#hook_param) }
    };

    quote! {
        #[no_mangle]
        pub extern "Rust" fn #hook_fn(#hook_param: #hook_param_type) {
            ic_cdk::spawn(async {
                let result = #function_call;
                #hook_return
            });
        }
    }
}

fn parse_hook_return(signature: &Signature) -> proc_macro2::TokenStream {
    let return_length = match &signature.output {
        ReturnType::Default => 0,
        ReturnType::Type(_, ty) => match ty.as_ref() {
            Type::Tuple(tuple) => tuple.elems.len(),
            _ => 1,
        },
    };

    if return_length == 1 {
        quote! {
            match result {
                Ok(_) => {}
                Err(e) => {
                    let error = format!("{}", e);
                    ic_cdk::trap(&error);
                }
            }
        }
    } else {
        quote! {}
    }
}

fn parse_assert_hook(
    signature: &Signature,
    hook_fn: &Ident,
    hook_param: &Ident,
    hook_param_type: &Ident,
) -> proc_macro2::TokenStream {
    let func_name = &signature.ident;

    let function_call = quote! { #func_name(#hook_param) };

    quote! {
        #[no_mangle]
        pub extern "Rust" fn #hook_fn(#hook_param: #hook_param_type) -> Result<(), String> {
            #function_call
        }
    }
}

fn parse_lifecycle_hook(
    ast: &ItemFn,
    signature: &Signature,
    hook_fn: &Ident,
) -> Result<TokenStream, String> {
    let hook_body = parse_lifecycle_hook_body(signature, hook_fn);

    let result = quote! {
        #ast

        #hook_body
    };

    Ok(result.into())
}

fn parse_lifecycle_hook_body(signature: &Signature, hook_fn: &Ident) -> proc_macro2::TokenStream {
    let hook_return = parse_hook_return(signature);

    let func_name = &signature.ident;

    let function_call = quote! { #func_name() };

    quote! {
        #[no_mangle]
        pub extern "Rust" fn #hook_fn() {
            let result = #function_call;
            #hook_return
        }
    }
}

fn parse_lifecycle_sync_hook(
    ast: &ItemFn,
    signature: &Signature,
    hook_fn: &Ident,
) -> Result<TokenStream, String> {
    let hook_body = parse_lifecycle_hook_sync_body(signature, hook_fn);

    let result = quote! {
        #ast

        #hook_body
    };

    Ok(result.into())
}

fn parse_lifecycle_hook_sync_body(signature: &Signature, hook_fn: &Ident) -> proc_macro2::TokenStream {
    let func_name = &signature.ident;

    let function_call = quote! { #func_name() };

    quote! {
        #[no_mangle]
        pub extern "Rust" fn #hook_fn() {
            #function_call;
        }
    }
}