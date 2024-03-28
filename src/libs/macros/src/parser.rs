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
    OnUploadAsset,
    OnDeleteAsset,
    OnDeleteManyAssets,
    AssertSetDoc,
    AssertDeleteDoc,
}

const CONTEXT_PARAM: &str = "context";

fn map_hook_name(hook: Hook) -> String {
    match hook {
        Hook::OnSetDoc => "juno_on_set_doc".to_string(),
        Hook::OnSetManyDocs => "juno_on_set_many_docs".to_string(),
        Hook::OnDeleteDoc => "juno_on_delete_doc".to_string(),
        Hook::OnDeleteManyDocs => "juno_on_delete_many_docs".to_string(),
        Hook::OnUploadAsset => "juno_on_upload_asset".to_string(),
        Hook::OnDeleteAsset => "juno_on_delete_asset".to_string(),
        Hook::OnDeleteManyAssets => "juno_on_delete_many_assets".to_string(),
        Hook::AssertSetDoc => "juno_assert_set_doc".to_string(),
        Hook::AssertDeleteDoc => "juno_assert_delete_doc".to_string(),
    }
}

fn map_hook_collections(hook: Hook) -> String {
    match hook {
        Hook::OnSetDoc => "juno_on_set_doc_collections".to_string(),
        Hook::OnSetManyDocs => "juno_on_set_many_docs_collections".to_string(),
        Hook::OnDeleteDoc => "juno_on_delete_doc_collections".to_string(),
        Hook::OnDeleteManyDocs => "juno_on_delete_many_docs_collections".to_string(),
        Hook::OnUploadAsset => "juno_on_upload_asset_collections".to_string(),
        Hook::OnDeleteAsset => "juno_on_delete_asset_collections".to_string(),
        Hook::OnDeleteManyAssets => "juno_on_delete_many_assets_collections".to_string(),
        Hook::AssertSetDoc => "juno_assert_set_doc_collections".to_string(),
        Hook::AssertDeleteDoc => "juno_assert_delete_doc_collections".to_string(),
    }
}

fn map_hook_type(hook: &Hook) -> String {
    match hook {
        Hook::OnSetDoc => "OnSetDocContext".to_string(),
        Hook::OnSetManyDocs => "OnSetManyDocsContext".to_string(),
        Hook::OnDeleteDoc => "OnDeleteDocContext".to_string(),
        Hook::OnDeleteManyDocs => "OnDeleteManyDocsContext".to_string(),
        Hook::OnUploadAsset => "OnUploadAssetContext".to_string(),
        Hook::OnDeleteAsset => "OnDeleteAssetContext".to_string(),
        Hook::OnDeleteManyAssets => "OnDeleteManyAssetsContext".to_string(),
        Hook::AssertSetDoc => "AssertSetDocContext".to_string(),
        Hook::AssertDeleteDoc => "AssertDeleteDocContext".to_string(),
    }
}

pub fn hook_macro(hook: Hook, attr: TokenStream, item: TokenStream) -> TokenStream {
    parse_hook(&hook, attr, item).map_or_else(|e| e.to_error(), Into::into)
}

fn parse_hook(hook: &Hook, attr: TokenStream, item: TokenStream) -> Result<TokenStream, String> {
    let converted_attr: proc_macro2::TokenStream = attr.into();
    let attrs = from_tokenstream::<HookAttributes>(&converted_attr)
        .map_err(|_| "Expected valid attributes to register the hooks")?;

    let ast = parse::<ItemFn>(item).map_err(|_| "Expected a function to register the hooks")?;

    let signature = &ast.sig;

    let hook_fn = Ident::new(&map_hook_name(hook.clone()), proc_macro2::Span::call_site());
    let hook_collections_fn = Ident::new(
        &map_hook_collections(hook.clone()),
        proc_macro2::Span::call_site(),
    );
    let hook_param = Ident::new(CONTEXT_PARAM, proc_macro2::Span::call_site());
    let hook_param_type = Ident::new(&map_hook_type(hook), proc_macro2::Span::call_site());

    let collections_tokens = if let Some(collections) = attrs.collections {
        let tokens = collections.iter().map(|col| quote! { #col.to_string() });
        quote! { Some(vec![#(#tokens,)*]) }
    } else {
        quote! { None }
    };

    let hook_body = match hook {
        Hook::AssertSetDoc | Hook::AssertDeleteDoc => {
            parse_assert_hook(&signature, &hook_fn, &hook_param, &hook_param_type)
        }
        _ => parse_on_hook(&signature, &hook_fn, &hook_param, &hook_param_type),
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

    let return_length = match &signature.output {
        ReturnType::Default => 0,
        ReturnType::Type(_, ty) => match ty.as_ref() {
            Type::Tuple(tuple) => tuple.elems.len(),
            _ => 1,
        },
    };

    let hook_return = if return_length == 1 {
        quote! {
            match result {
                Ok(_) => {}
                Err(e) => {
                    let error = format!("{}", e);
                    ic_cdk::print(&error);
                    ic_cdk::trap(&error);
                }
            }
        }
    } else {
        quote! {}
    };

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
