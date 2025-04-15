use crate::hooks::js::impls::utils::{
    from_bigint_js, from_bigint_js_to_usize, into_bigint_from_usize,
    into_optional_bigint_from_usize,
};
use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::hooks::JsKey;
use crate::hooks::js::types::list::{
    JsListMatcher, JsListOrder, JsListOrderField, JsListPaginate, JsListParams, JsListResults,
    JsTimestampMatcher,
};
use junobuild_satellite::Doc;
use junobuild_shared::types::list::{
    ListMatcher, ListOrder, ListOrderField, ListPaginate, ListParams, ListResults, TimestampMatcher,
};
use rquickjs::{
    Array, BigInt, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, Value,
};

impl<'js> JsListParams<'js> {
    pub fn to_params(&self) -> JsResult<ListParams> {
        Ok(ListParams {
            matcher: self.matcher.as_ref().map(|m| m.to_matcher()).transpose()?,
            paginate: self
                .paginate
                .as_ref()
                .map(|p| p.to_paginate())
                .transpose()?,
            order: self.order.as_ref().map(|o| o.to_order()).transpose()?,
            owner: self.owner.as_ref().map(|p| p.to_principal()).transpose()?,
        })
    }
}

impl JsListMatcher {
    pub fn to_matcher(&self) -> JsResult<ListMatcher> {
        Ok(ListMatcher {
            key: self.key.clone(),
            description: self.description.clone(),
            created_at: self
                .created_at
                .as_ref()
                .map(|m| m.to_matcher())
                .transpose()?,
            updated_at: self
                .updated_at
                .as_ref()
                .map(|m| m.to_matcher())
                .transpose()?,
        })
    }
}

impl<'js> JsListPaginate<'js> {
    pub fn to_paginate(&self) -> JsResult<ListPaginate> {
        Ok(ListPaginate {
            start_after: self.start_after.clone(),
            limit: self
                .limit
                .as_ref()
                .map(|b| from_bigint_js_to_usize(b.clone()))
                .transpose()?,
        })
    }
}

impl JsListOrder {
    pub fn to_order(&self) -> JsResult<ListOrder> {
        Ok(ListOrder {
            desc: self.desc,
            field: self.field.to_field(),
        })
    }
}

impl JsListOrderField {
    pub fn to_field(&self) -> ListOrderField {
        match self {
            JsListOrderField::Keys => ListOrderField::Keys,
            JsListOrderField::CreatedAt => ListOrderField::CreatedAt,
            JsListOrderField::UpdatedAt => ListOrderField::UpdatedAt,
        }
    }
}

impl JsTimestampMatcher {
    pub fn to_matcher(&self) -> JsResult<TimestampMatcher> {
        Ok(match self {
            JsTimestampMatcher::Equal(ts) => TimestampMatcher::Equal(*ts),
            JsTimestampMatcher::GreaterThan(ts) => TimestampMatcher::GreaterThan(*ts),
            JsTimestampMatcher::LessThan(ts) => TimestampMatcher::LessThan(*ts),
            JsTimestampMatcher::Between(start, end) => TimestampMatcher::Between(*start, *end),
        })
    }
}

impl<'js> JsListResults<'js, JsDoc<'js>> {
    pub fn from_doc_results(ctx: &Ctx<'js>, results: &ListResults<Doc>) -> JsResult<Self> {
        Ok(Self {
            items: results
                .items
                .iter()
                .map(|(key, doc)| Ok((key.clone(), JsDoc::from_doc(ctx, doc.clone())?)))
                .collect::<JsResult<Vec<(JsKey, JsDoc<'js>)>>>()?,
            items_length: into_bigint_from_usize(ctx, results.items_length)?,
            items_page: into_optional_bigint_from_usize(ctx, results.items_page)?,
            matches_length: into_bigint_from_usize(ctx, results.matches_length)?,
            matches_pages: into_optional_bigint_from_usize(ctx, results.matches_pages)?,
        })
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsListResults<'js, JsDoc<'js>> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        let js_items = Array::new(ctx.clone())?;

        for (i, (key, doc)) in self.items.into_iter().enumerate() {
            let arr = Array::new(ctx.clone())?;
            arr.set(0, key.into_js(ctx))?;
            arr.set(1, doc.into_js(ctx)?)?;
            js_items.set(i, arr)?;
        }

        obj.set("items", js_items)?;
        obj.set("items_length", self.items_length)?;
        obj.set("items_page", self.items_page)?;
        obj.set("matches_length", self.matches_length)?;
        obj.set("matches_pages", self.matches_pages)?;

        Ok(obj.into_value())
    }
}

// ---------------------------------------------------------
// FromJs
// ---------------------------------------------------------

impl<'js> FromJs<'js> for JsListPaginate<'js> {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        Ok(Self {
            start_after: obj.get("start_after").ok(),
            limit: obj.get("limit").ok(),
        })
    }
}

impl<'js> FromJs<'js> for JsListOrderField {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let s: String = String::from_js(ctx, value)?;

        match s.as_str() {
            "keys" => Ok(Self::Keys),
            "created_at" => Ok(Self::CreatedAt),
            "updated_at" => Ok(Self::UpdatedAt),
            _ => Err(JsError::new_from_js("JsListOrderField", "ListOrderField")),
        }
    }
}

impl<'js> FromJs<'js> for JsListOrder {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let field = JsListOrderField::from_js(ctx, obj.get("field")?)?;

        Ok(Self {
            desc: obj.get("desc")?,
            field,
        })
    }
}

impl<'js> FromJs<'js> for JsTimestampMatcher {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        if let Ok(equal) = obj.get::<_, BigInt>("equal") {
            let value = from_bigint_js(equal)?;
            return Ok(Self::Equal(value));
        }

        if let Ok(gt) = obj.get::<_, BigInt>("greater_than") {
            let value = from_bigint_js(gt)?;
            return Ok(Self::GreaterThan(value));
        }

        if let Ok(lt) = obj.get::<_, BigInt>("less_than") {
            let value = from_bigint_js(lt)?;
            return Ok(Self::LessThan(value));
        }

        if let Ok(vec) = obj.get::<_, Vec<BigInt>>("between") {
            if vec.len() == 2 {
                let from = from_bigint_js(vec[0].clone())?;
                let to = from_bigint_js(vec[1].clone())?;
                return Ok(Self::Between(from, to));
            }
        }

        Err(JsError::new_from_js(
            "JsTimestampMatcher",
            "Invalid matcher",
        ))
    }
}

impl<'js> FromJs<'js> for JsListMatcher {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let created_at = obj
            .get::<_, Option<Value>>("created_at")?
            .map(|value| JsTimestampMatcher::from_js(ctx, value))
            .transpose()?;

        let updated_at = obj
            .get::<_, Option<Value>>("updated_at")?
            .map(|value| JsTimestampMatcher::from_js(ctx, value))
            .transpose()?;

        Ok(Self {
            key: obj.get("key").ok(),
            description: obj.get("description").ok(),
            created_at,
            updated_at,
        })
    }
}

impl<'js> FromJs<'js> for JsListParams<'js> {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let matcher = obj
            .get::<_, Option<Value>>("matcher")?
            .map(|v| JsListMatcher::from_js(ctx, v))
            .transpose()?;

        let paginate = obj
            .get::<_, Option<Value>>("paginate")?
            .map(|v| JsListPaginate::from_js(ctx, v))
            .transpose()?;

        let order = obj
            .get::<_, Option<Value>>("order")?
            .map(|v| JsListOrder::from_js(ctx, v))
            .transpose()?;

        Ok(Self {
            matcher,
            paginate,
            order,
            owner: obj.get("owner").ok(),
        })
    }
}
