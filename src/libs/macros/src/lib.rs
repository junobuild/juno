extern crate proc_macro;

mod error;
mod parser;

use parser::{hook_macro, Hook};
use proc_macro::TokenStream;

#[proc_macro_attribute]
pub fn on_set_doc(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnSetDoc, attr, item)
}

#[proc_macro_attribute]
pub fn on_delete_doc(attr: TokenStream, item: TokenStream) -> TokenStream {
    hook_macro(Hook::OnDeleteDoc, attr, item)
}
