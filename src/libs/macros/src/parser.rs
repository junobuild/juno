use crate::error::MacroError;
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse, ItemFn};

pub enum Hook {
    OnSetDoc,
    OnDeleteDoc,
}

fn map_hook_fn_name(hook: Hook) -> String {
    match hook {
        Hook::OnSetDoc => "juno_on_set_doc".to_string(),
        Hook::OnDeleteDoc => "juno_on_delete_doc".to_string(),
    }
}

pub fn hook_macro(hook: Hook, attr: TokenStream, item: TokenStream) -> TokenStream {
    parse_hook(hook, attr, item).map_or_else(|e| e.to_error().into(), Into::into)
}

fn parse_hook(hook: Hook, _attr: TokenStream, item: TokenStream) -> Result<TokenStream, String> {
    let ast = parse::<ItemFn>(item).map_err(|_| "Expected a function to register the hooks")?;

    let signature = &ast.sig;

    let func_name = &signature.ident;

    let is_async = signature.asyncness.is_some();

    let function_call = if is_async {
        quote! { #func_name(doc).await }
    } else {
        quote! { #func_name(doc) }
    };

    let hook_name = map_hook_fn_name(hook);

    let result = quote! {
        #ast

        #[no_mangle]
        pub extern "Rust" fn #hook_name(doc: Doc) {
            ic_cdk::spawn(async {
                #function_call
            });
        }
    };

    Ok(result.into())
}
