extern crate proc_macro;

use proc_macro::TokenStream;
use quote::quote;
use syn::{parse, ItemFn};

#[proc_macro_attribute]
pub fn on_set_doc(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let ast = parse::<ItemFn>(item).expect("Expected a function to register the hooks");
    let func_name = &ast.sig.ident;

    let result = quote! {
        #ast

        #[no_mangle]
        pub extern "Rust" fn juno_on_set_doc(doc: Doc) {
            #func_name(doc);
        }
    };

    result.into()
}
