use proc_macro::TokenStream;
use proc_macro2::Span;
use quote::quote;
use syn::{parse_macro_input, Data, DeriveInput, Fields, Type};

pub fn derive_function_data(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;
    let serialized_name = syn::Ident::new(&format!("{}DocData", name), Span::call_site());

    let fields = match &input.data {
        Data::Struct(s) => match &s.fields {
            Fields::Named(f) => &f.named,
            _ => panic!("FunctionData only supports named fields"),
        },
        _ => panic!("FunctionData only supports structs"),
    };

    let serialized_fields: Vec<_> = fields
        .iter()
        .map(|f| {
            let fname = &f.ident;
            let ftype = &f.ty;
            if let Some(with_path) = map_with_path(ftype) {
                quote! {
                    #[serde(with = #with_path)]
                    pub #fname: #ftype,
                }
            } else {
                quote! {
                    pub #fname: #ftype,
                }
            }
        })
        .collect();

    let into_fields: Vec<_> = fields
        .iter()
        .map(|f| {
            let fname = &f.ident;
            quote! { #fname: input.#fname, }
        })
        .collect();

    let from_fields: Vec<_> = fields
        .iter()
        .map(|f| {
            let fname = &f.ident;
            quote! { #fname: doc_data.#fname, }
        })
        .collect();

    quote! {
        #[derive(serde::Serialize, serde::Deserialize)]
        struct #serialized_name {
            #(#serialized_fields)*
        }

        impl From<#name> for #serialized_name {
            fn from(input: #name) -> Self {
                Self {
                    #(#into_fields)*
                }
            }
        }

        impl From<#serialized_name> for #name {
            fn from(doc_data: #serialized_name) -> Self {
                Self {
                    #(#from_fields)*
                }
            }
        }

        impl #name {
            pub fn into_doc_data(self) -> Result<Vec<u8>, String> {
                junobuild_utils::encode_doc_data(&#serialized_name::from(self))
            }

            pub fn from_doc_data(bytes: &[u8]) -> Result<Self, String> {
                junobuild_utils::decode_doc_data::<#serialized_name>(bytes)
                    .map(#name::from)
            }
        }
    }
    .into()
}

fn map_with_path(ty: &Type) -> Option<String> {
    let type_str = quote!(#ty).to_string();
    match type_str.as_str() {
        "Principal" | "candid :: Principal" => Some("junobuild_utils::with::principal".to_string()),
        "Vec < u8 >" => Some("junobuild_utils::with::uint8array".to_string()),
        "u64" => Some("junobuild_utils::with::bigint".to_string()),
        _ => None,
    }
}
