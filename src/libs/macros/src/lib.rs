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
            junobuild_satellite::init();
            #register_name();
        }

        #[ic_cdk::post_upgrade]
        fn #post_upgrade_name() {
            junobuild_satellite::post_upgrade();
            #register_name();
        }

        fn #register_name() {
            let hooks = #func_name();
            junobuild_satellite::register_hooks(hooks);
        }
    };

    result.into()
}
