use crate::error::MacroError;
use proc_macro::TokenStream;
use quote::quote;
use std::string::ToString;
use syn::{parse, ItemFn};

#[derive(Clone)]
pub enum Hook {
    OnSetDoc,
    OnSetManyDocs,
    OnDeleteDoc,
    OnDeleteManyDocs,
}

const DOC_PARAM: &str = "param";

fn map_hook_name(hook: Hook) -> String {
    match hook {
        Hook::OnSetDoc => "juno_on_set_doc".to_string(),
        Hook::OnSetManyDocs => "juno_on_set_many_docs".to_string(),
        Hook::OnDeleteDoc => "juno_on_delete_doc".to_string(),
        Hook::OnDeleteManyDocs => "juno_on_delete_many_docs".to_string(),
    }
}

fn map_hook_type(hook: Hook) -> String {
    match hook {
        Hook::OnSetDoc => "Doc".to_string(),
        Hook::OnSetManyDocs => "Vec<(Key, Doc)>".to_string(),
        Hook::OnDeleteDoc => "Option<Doc>".to_string(),
        Hook::OnDeleteManyDocs => "Vec<(Key, Option<Doc>)>".to_string(),
    }
}

pub fn hook_macro(hook: Hook, attr: TokenStream, item: TokenStream) -> TokenStream {
    parse_hook(hook, attr, item).map_or_else(|e| e.to_error(), Into::into)
}

fn parse_hook(hook: Hook, _attr: TokenStream, item: TokenStream) -> Result<TokenStream, String> {
    let ast = parse::<ItemFn>(item).map_err(|_| "Expected a function to register the hooks")?;

    let signature = &ast.sig;
    let func_name = &signature.ident;
    let is_async = signature.asyncness.is_some();

    let hook_fn =
        proc_macro2::Ident::new(&map_hook_name(hook.clone()), proc_macro2::Span::call_site());
    let hook_param = proc_macro2::Ident::new(DOC_PARAM, proc_macro2::Span::call_site());
    let hook_param_type =
        proc_macro2::Ident::new(&map_hook_type(hook), proc_macro2::Span::call_site());

    let function_call = if is_async {
        quote! { #func_name(#hook_param).await }
    } else {
        quote! { #func_name(#hook_param) }
    };

    let result = quote! {
        #ast

        #[no_mangle]
        pub extern "Rust" fn #hook_fn(#hook_param: #hook_param_type) {
            ic_cdk::spawn(async {
                #function_call
            });
        }
    };

    Ok(result.into())
}
