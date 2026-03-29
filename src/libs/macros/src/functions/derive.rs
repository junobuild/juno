use proc_macro::TokenStream;
use proc_macro2::{Span, TokenStream as TokenStream2};
use quote::quote;
use syn::{parse_macro_input, Data, DeriveInput, Fields, Type};

pub fn derive_json_data(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;
    let serialized_name = syn::Ident::new(&format!("{}JsonData", name), Span::call_site());

    match &input.data {
        Data::Struct(s) => match &s.fields {
            Fields::Named(f) => derive_struct(name, &serialized_name, &f.named),
            _ => panic!("JsonData only supports named fields"),
        },
        Data::Enum(e) => derive_enum(name, &serialized_name, &e.variants, &input.attrs),
        _ => panic!("JsonData only supports structs and enums"),
    }
}

fn derive_struct(
    name: &syn::Ident,
    serialized_name: &syn::Ident,
    fields: &syn::punctuated::Punctuated<syn::Field, syn::token::Comma>,
) -> TokenStream {
    let serialized_fields: Vec<_> = fields
        .iter()
        .map(|f| {
            let fname = &f.ident;
            let ftype = &f.ty;
            let serde_attrs: Vec<_> = f
                .attrs
                .iter()
                .filter(|a| a.path().is_ident("serde"))
                .collect();
            if let Some(with_path) = map_with_path(ftype) {
                quote! {
                    #[serde(with = #with_path)]
                    #(#serde_attrs)*
                    pub #fname: #ftype,
                }
            } else if has_nested_attr(f) {
                let nested_type = nested_json_data_ident(ftype);
                quote! {
                    #(#serde_attrs)*
                    pub #fname: #nested_type,
                }
            } else {
                quote! {
                    #(#serde_attrs)*
                    pub #fname: #ftype,
                }
            }
        })
        .collect();

    let into_fields: Vec<_> = fields
        .iter()
        .map(|f| {
            let fname = &f.ident;
            if has_nested_attr(f) {
                quote! { #fname: input.#fname.into(), }
            } else {
                quote! { #fname: input.#fname, }
            }
        })
        .collect();

    let from_fields: Vec<_> = fields
        .iter()
        .map(|f| {
            let fname = &f.ident;
            if has_nested_attr(f) {
                quote! { #fname: json_data.#fname.into(), }
            } else {
                quote! { #fname: json_data.#fname, }
            }
        })
        .collect();

    quote! {
        #[derive(serde::Serialize, serde::Deserialize)]
        #[serde(rename_all = "camelCase")]
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
            fn from(json_data: #serialized_name) -> Self {
                Self {
                    #(#from_fields)*
                }
            }
        }

        impl junobuild_utils::IntoJsonData for #name {
            fn into_json_data(self) -> Result<Vec<u8>, String> {
                junobuild_utils::encode_json_data(&#serialized_name::from(self))
            }
        }

        impl junobuild_utils::FromJsonData for #name {
            fn from_json_data(bytes: &[u8]) -> Result<Self, String> {
                junobuild_utils::decode_json_data::<#serialized_name>(bytes)
                    .map(#name::from)
            }
        }
    }
    .into()
}

fn derive_enum(
    name: &syn::Ident,
    serialized_name: &syn::Ident,
    variants: &syn::punctuated::Punctuated<syn::Variant, syn::token::Comma>,
    attrs: &[syn::Attribute],
) -> TokenStream {
    // Extracts the #[json_data(tag = "type")] attribute and converts it to #[serde(tag = "type")] for the mirror enum.
    let serde_tag_attr: TokenStream2 = attrs
        .iter()
        .find(|a| a.path().is_ident("json_data"))
        .and_then(|a| {
            let meta = a.parse_args::<syn::MetaNameValue>().ok()?;

            if meta.path.is_ident("tag") {
                if let syn::Expr::Lit(syn::ExprLit {
                    lit: syn::Lit::Str(s),
                    ..
                }) = meta.value
                {
                    let tag_value = s.value();
                    return Some(quote! { #[serde(tag = #tag_value)] });
                }
            }
            None
        })
        .expect("JsonData on enums requires #[json_data(tag = \"...\")]");

    // carries through any #[serde(...)] attributes (like #[serde(rename = "active")])
    // maps field types to their JSON-safe equivalents:
    // - replacing Principal with #[serde(with = "...")]
    // - replacing nested struct types with their XxxJsonData mirror types
    let serialized_variants: Vec<_> = variants
        .iter()
        .map(|v| {
            let vname = &v.ident;
            let variant_serde_attrs: Vec<_> = v
                .attrs
                .iter()
                .filter(|a| a.path().is_ident("serde"))
                .collect();
            match &v.fields {
                Fields::Named(f) => {
                    let fields: Vec<_> = f
                        .named
                        .iter()
                        .map(|f| {
                            let fname = &f.ident;
                            let ftype = &f.ty;

                            // Support field rename e.g. #[serde(rename = "type")] for used in discriminatedUnion
                            let serde_attrs: Vec<_> = f
                                .attrs
                                .iter()
                                .filter(|a| a.path().is_ident("serde"))
                                .collect();

                            if let Some(with_path) = map_with_path(ftype) {
                                quote! {
                                    #[serde(with = #with_path)]
                                    #(#serde_attrs)*
                                    #fname: #ftype,
                                }
                            } else if has_nested_attr(f) {
                                let nested_type = nested_json_data_ident(ftype);
                                quote! {
                                    #(#serde_attrs)*
                                    #fname: #nested_type,
                                }
                            } else {
                                quote! {
                                    #(#serde_attrs)*
                                    #fname: #ftype,
                                }
                            }
                        })
                        .collect();
                    quote! { #(#variant_serde_attrs)* #vname { #(#fields)* }, }
                }
                Fields::Unnamed(f) => {
                    let field = f.unnamed.first().expect("tuple variant must have one field");
                    let ftype = &field.ty;
                    if let Some(with_path) = map_with_path(ftype) {
                        quote! { #(#variant_serde_attrs)* #vname(#[serde(with = #with_path)] #ftype), }
                    } else if has_nested_attr(field) {
                        let nested_type = nested_json_data_ident(ftype);
                        quote! { #(#variant_serde_attrs)* #vname(#nested_type), }
                    } else {
                        quote! { #(#variant_serde_attrs)* #vname(#ftype), }
                    }
                }
                Fields::Unit => quote! { #(#variant_serde_attrs)* #vname, },
            }
        })
        .collect();

    // converts each variant of the original enum into the corresponding mirror enum variant
    let into_variants: Vec<_> = variants
        .iter()
        .map(|v| {
            let vname = &v.ident;
            match &v.fields {
                Fields::Named(f) => {
                    let fnames: Vec<_> = f.named.iter().map(|f| &f.ident).collect();
                    let conversions: Vec<_> = f
                        .named
                        .iter()
                        .map(|f| {
                            let fname = &f.ident;
                            if has_nested_attr(f) {
                                quote! { #fname: #fname.into(), }
                            } else {
                                quote! { #fname: #fname, }
                            }
                        })
                        .collect();
                    quote! {
                        #name::#vname { #(#fnames,)* } => #serialized_name::#vname { #(#conversions)* },
                    }
                }
                Fields::Unnamed(f) => {
                    let field = f.unnamed.first().expect("tuple variant must have one field");
                    if has_nested_attr(field) {
                        quote! { #name::#vname(v) => #serialized_name::#vname(v.into()), }
                    } else {
                        quote! { #name::#vname(v) => #serialized_name::#vname(v), }
                    }
                }
                Fields::Unit => quote! {
                    #name::#vname => #serialized_name::#vname,
                },
            }
        })
        .collect();

    // Same as into_variants but reverse direction
    let from_variants: Vec<_> = variants
        .iter()
        .map(|v| {
            let vname = &v.ident;
            match &v.fields {
                Fields::Named(f) => {
                    let fnames: Vec<_> = f.named.iter().map(|f| &f.ident).collect();
                    let conversions: Vec<_> = f
                        .named
                        .iter()
                        .map(|f| {
                            let fname = &f.ident;
                            if has_nested_attr(f) {
                                quote! { #fname: #fname.into(), }
                            } else {
                                quote! { #fname: #fname, }
                            }
                        })
                        .collect();
                    quote! {
                        #serialized_name::#vname { #(#fnames,)* } => #name::#vname { #(#conversions)* },
                    }
                }
                Fields::Unnamed(f) => {
                    let field = f.unnamed.first().expect("tuple variant must have one field");
                    if has_nested_attr(field) {
                        quote! { #serialized_name::#vname(v) => #name::#vname(v.into()), }
                    } else {
                        quote! { #serialized_name::#vname(v) => #name::#vname(v), }
                    }
                }
                Fields::Unit => quote! {
                    #serialized_name::#vname => #name::#vname,
                },
            }
        })
        .collect();

    quote! {
        #[derive(serde::Serialize, serde::Deserialize)]
        #serde_tag_attr
        enum #serialized_name {
            #(#serialized_variants)*
        }

        impl From<#name> for #serialized_name {
            fn from(input: #name) -> Self {
                match input {
                    #(#into_variants)*
                }
            }
        }

        impl From<#serialized_name> for #name {
            fn from(json_data: #serialized_name) -> Self {
                match json_data {
                    #(#from_variants)*
                }
            }
        }

        impl junobuild_utils::IntoJsonData for #name {
            fn into_json_data(self) -> Result<Vec<u8>, String> {
                junobuild_utils::encode_json_data(&#serialized_name::from(self))
            }
        }

        impl junobuild_utils::FromJsonData for #name {
            fn from_json_data(bytes: &[u8]) -> Result<Self, String> {
                junobuild_utils::decode_json_data::<#serialized_name>(bytes)
                    .map(#name::from)
            }
        }
    }
    .into()
}

fn has_nested_attr(field: &syn::Field) -> bool {
    field.attrs.iter().any(|attr| {
        attr.path().is_ident("json_data")
            && attr.parse_args::<syn::Ident>().is_ok_and(|i| i == "nested")
    })
}

fn nested_json_data_ident(ty: &Type) -> Type {
    if let Type::Path(mut tp) = ty.clone() {
        let seg = tp.path.segments.last_mut().unwrap();
        if seg.ident == "Option" {
            if let syn::PathArguments::AngleBracketed(ref mut args) = seg.arguments {
                if let Some(syn::GenericArgument::Type(inner)) = args.args.first_mut() {
                    *inner = nested_json_data_ident(inner);
                }
            }
            return Type::Path(tp);
        }
        seg.ident = syn::Ident::new(&format!("{}JsonData", seg.ident), seg.ident.span());
        return Type::Path(tp);
    }
    ty.clone()
}

fn map_with_path(ty: &Type) -> Option<String> {
    if let Some(inner) = unwrap_option(ty) {
        return map_with_path(inner).map(|path| format!("{}_opt", path));
    }

    let type_str = quote!(#ty).to_string();
    match type_str.as_str() {
        "Principal" | "candid :: Principal" => Some("junobuild_utils::with::principal".to_string()),
        "Vec < u8 >" => Some("junobuild_utils::with::uint8array".to_string()),
        "u64" => Some("junobuild_utils::with::bigint".to_string()),
        _ => None,
    }
}

fn unwrap_option(ty: &Type) -> Option<&Type> {
    if let Type::Path(tp) = ty {
        let seg = tp.path.segments.last()?;
        if seg.ident == "Option" {
            if let syn::PathArguments::AngleBracketed(ref args) = seg.arguments {
                if let Some(syn::GenericArgument::Type(inner)) = args.args.first() {
                    return Some(inner);
                }
            }
        }
    }
    None
}
