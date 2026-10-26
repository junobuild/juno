#![allow(clippy::inherent_to_string)]
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    rc::Rc,
};

use crate::js::apis::node::llrt::llrt_utils::{
    bytes::get_lossy_string,
    class::{iterator_result, live_iterator, IterKind},
    primordials::{BasePrimordials, Primordial},
    string::get_coerced_defined_string,
};
use rquickjs::{
    atom::PredefinedAtom, class::Trace, function::Opt, prelude::This, Array, Class, Coerced, Ctx,
    Exception, FromJs, Function, IntoJs, Null, Object, Result, Symbol, Value,
};
use url::Url;

use super::convert_trailing_space;

/// Represents `URLSearchParams` in the JavaScript context
///
/// <https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams>
///
/// # Examples
///
/// ```rust,ignore
/// // This is JavaScript
/// const params = new URLSearchParams();
/// params.set("foo", "bar");
/// ```
#[derive(Clone, Trace, rquickjs::JsLifetime)]
#[rquickjs::class]
pub struct URLSearchParams {
    // URL and URLSearchParams work together to manipulate URLs, so using a
    // reference counter (Rc) allows them to have shared ownership of the
    // undering Url, and a RefCell allows interior mutability.
    #[qjs(skip_trace)]
    pub url: Rc<RefCell<Url>>,
}

// URLSearchParams is designed to operate directly on the underlying Url to
// avoid maintaining derived state that can get out of sync. When it's used
// independently, it still needs a valid URL (http://example.com), but this
// doesn't have any effect on using URLSearchParams with URL as the params are
// stringified when added to a URL.
//
// ```js
// const params = new URLSearchParams("foo=bar");
// const url = new URL("http://github.com");
// url.search = params; // This works as expected
// ```
#[rquickjs::methods(rename_all = "camelCase")]
impl<'js> URLSearchParams {
    #[qjs(constructor)]
    pub fn new(ctx: Ctx<'js>, init: Opt<Value<'js>>) -> Result<Self> {
        if let Some(init) = init.into_inner() {
            if init.is_string() {
                let string = get_lossy_string(init)?;
                return Ok(Self::from_str(string));
            } else if init.is_array() {
                return Self::from_array(&ctx, unsafe { init.into_array().unwrap_unchecked() });
            } else if init.is_object() {
                return Self::from_object(&ctx, unsafe { init.into_object().unwrap_unchecked() });
            }
        }
        let url: Url = unsafe { "http://example.com".parse().unwrap_unchecked() };

        Ok(URLSearchParams {
            url: Rc::new(RefCell::new(url)),
        })
    }

    //
    // Properties
    //

    #[qjs(get)]
    pub fn size(&self) -> usize {
        self.url.borrow().query_pairs().count()
    }

    #[qjs(prop, rename = PredefinedAtom::SymbolToStringTag, configurable)]
    pub fn to_string_tag() -> &'static str {
        stringify!(URLSearchParams)
    }

    //
    // Instance methods
    //

    pub fn append(&mut self, key: Coerced<String>, value: Coerced<String>) {
        convert_trailing_space(&mut self.url.borrow_mut());

        self.url
            .borrow_mut()
            .query_pairs_mut()
            .append_pair(key.as_str(), value.as_str());
        self.sync_query();
    }

    pub fn delete(&mut self, key: Coerced<String>, value: Opt<Value<'js>>) {
        convert_trailing_space(&mut self.url.borrow_mut());

        let key = key.0;

        let value = get_coerced_defined_string(&value.0);

        let new_pairs: Vec<_> = self
            .url
            .borrow()
            .query_pairs()
            .filter(|(k, v)| {
                if let Some(value) = value.as_ref() {
                    return !(*k == key && *v == *value);
                }
                *k != key
            })
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect();

        if !new_pairs.is_empty() {
            self.url
                .borrow_mut()
                .query_pairs_mut()
                .clear()
                .extend_pairs(new_pairs);
        } else {
            self.url.borrow_mut().set_query(None);
        }
        self.sync_query();
    }

    pub fn entries(
        this: This<Class<'js, URLSearchParams>>,
        ctx: Ctx<'js>,
    ) -> Result<Class<'js, URLSearchParamsIter<'js>>> {
        URLSearchParamsIter::new(&ctx, this.0, IterKind::Entries)
    }

    pub fn for_each(
        this: This<Class<'js, URLSearchParams>>,
        callback: Function<'js>,
    ) -> Result<()> {
        // Re-read each index so the callback's mutations are observed.
        let mut index = 0;
        loop {
            let pair = this
                .0
                .borrow()
                .url
                .borrow()
                .query_pairs()
                .nth(index)
                .map(|(k, v)| (k.to_string(), v.to_string()));
            let Some((k, v)) = pair else {
                break;
            };
            () = callback.call((v, k, this.0.clone()))?;
            index += 1;
        }
        Ok(())
    }

    pub fn get(&mut self, ctx: Ctx<'js>, key: String) -> Result<Value<'js>> {
        match self
            .url
            .borrow()
            .query_pairs()
            .find(|(k, _)| *k == key)
            .map(|(_, v)| v)
        {
            Some(value) => value.into_js(&ctx),
            None => Null.into_js(&ctx),
        }
    }

    pub fn get_all(&mut self, key: String) -> Vec<String> {
        self.url
            .borrow()
            .query_pairs()
            .filter_map(|(k, v)| if k == key { Some(v.to_string()) } else { None })
            .collect()
    }

    pub fn has(&self, key: Coerced<String>, value: Opt<Value<'js>>) -> bool {
        let value = get_coerced_defined_string(&value.0);
        let key = key.0;
        self.url.borrow().query_pairs().any(|(k, v)| {
            if let Some(value) = value.as_ref() {
                return *k == key && *v == *value;
            }
            *k == key
        })
    }

    pub fn keys(
        this: This<Class<'js, URLSearchParams>>,
        ctx: Ctx<'js>,
    ) -> Result<Class<'js, URLSearchParamsIter<'js>>> {
        URLSearchParamsIter::new(&ctx, this.0, IterKind::Keys)
    }

    pub fn set(&mut self, key: Coerced<String>, value: Coerced<String>) {
        convert_trailing_space(&mut self.url.borrow_mut());

        let key = key.0;
        let value = value.0;

        // Use a HashSet just to filter duplicates
        let mut uniques = HashSet::new();
        let mut new_query_pairs: Vec<(String, String)> = Vec::new();

        for (k, v) in self.url.borrow().query_pairs() {
            // Update the value for an existing key
            let value = if k == key {
                value.clone()
            } else {
                v.to_string()
            };

            let query_pair = (k.to_string(), value);
            if uniques.insert(query_pair.clone()) {
                new_query_pairs.push(query_pair);
            }
        }

        // Append a new key/value pair
        let query_pair = (key, value);
        if uniques.insert(query_pair.clone()) {
            new_query_pairs.push(query_pair);
        }

        self.url
            .borrow_mut()
            .query_pairs_mut()
            .clear()
            .extend_pairs(new_query_pairs);
        self.sync_query();
    }

    pub fn sort(&mut self) {
        let mut new_pairs: Vec<(String, String)> =
            self.url.borrow().query_pairs().into_owned().collect();
        new_pairs.sort_by(|(a, _), (b, _)| {
            // Spec requires sorting by UTF-16 code units
            let a_utf16 = a.encode_utf16();
            let b_utf16 = b.encode_utf16();
            a_utf16.cmp(b_utf16)
        });

        if new_pairs.is_empty() {
            self.url.borrow_mut().set_query(None);
        } else {
            self.url
                .borrow_mut()
                .query_pairs_mut()
                .clear()
                .extend_pairs(new_pairs);
        }
        self.sync_query();
    }

    pub fn to_string(&self) -> String {
        // The Url create doesn't properly encode query params for all edge
        // cases, so we need to construct the query string by percent-encoding
        // each key/value
        // TODO: This should probably be fixed in the Url crate
        let url = self.url.borrow();
        url.query_pairs().fold(
            String::with_capacity(url.query().map_or(0, |q| q.len())),
            |mut acc, (key, value)| {
                if !acc.is_empty() {
                    acc.push('&');
                }
                url::form_urlencoded::byte_serialize(key.as_bytes()).for_each(|b| acc.push_str(b));
                acc.push('=');
                url::form_urlencoded::byte_serialize(value.as_bytes())
                    .for_each(|b| acc.push_str(b));
                acc
            },
        )
    }

    pub fn values(
        this: This<Class<'js, URLSearchParams>>,
        ctx: Ctx<'js>,
    ) -> Result<Class<'js, URLSearchParamsIter<'js>>> {
        URLSearchParamsIter::new(&ctx, this.0, IterKind::Values)
    }

    #[qjs(rename = PredefinedAtom::SymbolIterator)]
    pub fn iterator(
        this: This<Class<'js, URLSearchParams>>,
        ctx: Ctx<'js>,
    ) -> Result<Class<'js, URLSearchParamsIter<'js>>> {
        URLSearchParamsIter::new(&ctx, this.0, IterKind::Entries)
    }
}

impl<'js> URLSearchParams {
    fn read_entry(&self, index: usize, ctx: &Ctx<'js>) -> Result<Option<(Value<'js>, Value<'js>)>> {
        let pair = self
            .url
            .borrow()
            .query_pairs()
            .nth(index)
            .map(|(k, v)| (k.to_string(), v.to_string()));
        match pair {
            Some((k, v)) => Ok(Some((k.into_js(ctx)?, v.into_js(ctx)?))),
            None => Ok(None),
        }
    }

    /// Re-serialize the query string with proper percent-encoding.
    /// The url crate doesn't encode commas, so we rebuild the query
    /// using form_urlencoded::byte_serialize after each mutation.
    fn sync_query(&self) {
        let query = self.to_string();
        let mut url = self.url.borrow_mut();
        if query.is_empty() {
            url.set_query(None);
        } else {
            url.set_query(Some(&query));
        }
    }

    #[allow(clippy::should_implement_trait)]
    pub fn from_str(query: String) -> Self {
        let query = if !query.starts_with('?') {
            ["?", &query].concat()
        } else {
            query
        };
        let url = unsafe {
            "http://example.com"
                .parse::<Url>()
                .unwrap_unchecked()
                .join(&query)
                .unwrap_unchecked()
        };
        Self {
            url: Rc::new(RefCell::new(url)),
        }
    }

    pub fn from_url(url: &Rc<RefCell<Url>>) -> Self {
        Self {
            url: Rc::clone(url),
        }
    }

    pub fn from_array(ctx: &Ctx<'js>, array: Array<'js>) -> Result<Self> {
        let mut url: Url = "http://example.com".parse().unwrap();
        let query_pairs: Vec<(String, String)> = array
            .into_iter()
            .map(|value| {
                if let Ok(value) = value {
                    if let Some(pair) = value.as_array() {
                        if pair.len() == 2 {
                            let key_val: Value = pair.get(0)?;
                            let val_val: Value = pair.get(1)?;
                            let key = if key_val.is_string() {
                                get_lossy_string(key_val)?
                            } else {
                                Coerced::<String>::from_js(ctx, key_val)?.0
                            };
                            let value = if val_val.is_string() {
                                get_lossy_string(val_val)?
                            } else {
                                Coerced::<String>::from_js(ctx, val_val)?.0
                            };
                            return Ok((key, value));
                        }
                    }
                };
                Err(Exception::throw_type(
                    ctx,
                    "Invalid tuple: Each query pair must be an iterable [name, value] tuple",
                ))
            })
            .collect::<Result<Vec<_>>>()?
            .into_iter()
            .collect();

        url.query_pairs_mut().extend_pairs(query_pairs);

        Ok(Self {
            url: Rc::new(RefCell::new(url)),
        })
    }

    pub fn from_object(ctx: &Ctx<'js>, object: Object<'js>) -> Result<Self> {
        let iterator = Symbol::iterator(ctx.clone());
        if object.contains_key(iterator)? {
            let query_pairs: Array = BasePrimordials::get(ctx)?
                .function_array_from
                .call((object,))?;
            return Self::from_array(ctx, query_pairs);
        }

        let mut url: Url = "http://example.com".parse().unwrap();
        let raw_pairs: Vec<(String, String)> = object
            .keys::<Value<'js>>()
            .map(|key| {
                let key = key?;
                let key_string = if key.is_string() {
                    get_lossy_string(key.clone())?
                } else {
                    Coerced::<String>::from_js(ctx, key.clone())?.0
                };
                let value_val: Value = object.get(key)?;
                let value = if value_val.is_string() {
                    get_lossy_string(value_val)?
                } else {
                    Coerced::<String>::from_js(ctx, value_val)?.0
                };
                Ok((key_string, value))
            })
            .collect::<Result<Vec<_>>>()?;

        // WebIDL record conversion: when multiple input keys normalise to the
        // same string (e.g. two different lone surrogates both map to U+FFFD),
        // the *last* value wins. Preserve original iteration order for keys
        // that were only seen once.
        let mut order: Vec<String> = Vec::with_capacity(raw_pairs.len());
        let mut map: HashMap<String, String> = HashMap::with_capacity(raw_pairs.len());
        for (k, v) in raw_pairs {
            if !map.contains_key(&k) {
                order.push(k.clone());
            }
            map.insert(k, v);
        }
        let query_pairs: Vec<(String, String)> = order
            .into_iter()
            .map(|k| {
                let v = map.remove(&k).unwrap_or_default();
                (k, v)
            })
            .collect();

        url.query_pairs_mut().extend_pairs(query_pairs);

        Ok(Self {
            url: Rc::new(RefCell::new(url)),
        })
    }
}

/// Live iterator over a [`URLSearchParams`]. Re-reads on each `next()` so
/// mutations during iteration are observed.
#[derive(Trace, rquickjs::JsLifetime)]
#[rquickjs::class]
pub struct URLSearchParamsIter<'js> {
    params: Class<'js, URLSearchParams>,
    #[qjs(skip_trace)]
    index: usize,
    #[qjs(skip_trace)]
    kind: IterKind,
}

impl<'js> URLSearchParamsIter<'js> {
    fn new(
        ctx: &Ctx<'js>,
        params: Class<'js, URLSearchParams>,
        kind: IterKind,
    ) -> Result<Class<'js, Self>> {
        live_iterator(
            ctx,
            Self {
                params,
                index: 0,
                kind,
            },
        )
    }
}

#[rquickjs::methods]
impl<'js> URLSearchParamsIter<'js> {
    fn next(&mut self, ctx: Ctx<'js>) -> Result<Object<'js>> {
        let entry = self.params.borrow().read_entry(self.index, &ctx)?;
        if entry.is_some() {
            self.index += 1;
        }
        iterator_result(&ctx, self.kind, entry)
    }

    #[qjs(rename = PredefinedAtom::SymbolIterator)]
    fn iter(this: This<Class<'js, Self>>) -> Class<'js, Self> {
        this.0
    }
}