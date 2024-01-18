extern crate proc_macro;

use proc_macro::TokenStream;
use quote::quote;
use syn::{parse, ItemFn};

#[proc_macro_attribute]
pub fn on_set_doc(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let ast = parse::<ItemFn>(item).expect("Expected a function to register the hooks");

    let signature = &ast.sig;

    let func_name = &signature.ident;

    let is_async = signature.asyncness.is_some();

    let function_call = if is_async {
        quote! { #func_name(doc).await }
    } else {
        quote! { #func_name(doc) }
    };

    let result = quote! {
        #ast

        #[no_mangle]
        pub extern "Rust" fn juno_on_set_doc(doc: Doc) {
            ic_cdk::spawn(async {
                #function_call
            });
        }
    };

    result.into()
}
