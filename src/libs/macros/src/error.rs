use proc_macro::TokenStream;

pub trait MacroError {
    fn to_error(&self) -> TokenStream;
}

impl MacroError for String {
    fn to_error(&self) -> TokenStream {
        let error_message = format!("compile_error!({self:?});");
        error_message.parse().expect("Failed to parse Juno code.")
    }
}
