extern crate proc_macro;

use proc_macro::TokenStream;
use quote::{format_ident, quote};
use syn::{parse, ItemFn};

#[proc_macro_attribute]
pub fn init_satellite(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let ast = parse::<ItemFn>(item).expect("Expected a function to register the hooks");
    let func_name = &ast.sig.ident;

    let init_name = format_ident!("{}_init", func_name);
    let post_upgrade_name = format_ident!("{}_post_upgrade", func_name);
    let register_name = format_ident!("{}_register", func_name);

    let result = quote! {
        #ast

        #[ic_cdk::init]
        fn #init_name() {
            junobuild_satellite::init_satellite();
            #register_name();

            print("Init");
        }

        #[ic_cdk::post_upgrade]
        fn #post_upgrade_name() {
            junobuild_satellite::post_upgrade_satellite();
            #register_name();

            print("Post upgrade");
        }

        fn #register_name() {
            let hooks = #func_name();
            junobuild_satellite::hooks::register_hooks(hooks);
        }
    };

    result.into()
}
