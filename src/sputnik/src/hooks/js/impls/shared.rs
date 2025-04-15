use crate::hooks::js::impls::utils::{
    from_bigint_js, from_optional_bigint_js, into_bigint_js, into_optional_bigint_js,
};
use crate::hooks::js::types::shared::{
    JsController, JsControllerRecord, JsControllerScope, JsControllers, JsMetadata,
};
use crate::js::types::candid::JsRawPrincipal;
use junobuild_shared::types::state::{Controller, ControllerScope, Controllers, Timestamp};
use rquickjs::{
    Array, BigInt, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, Value,
};

impl<'js> JsController {
    pub fn from_controller(_ctx: &Ctx<'js>, controller: Controller) -> JsResult<Self> {
        Ok(Self {
            metadata: controller
                .metadata
                .into_iter()
                .map(|(key, value)| JsMetadata(key, value))
                .collect(),
            created_at: controller.created_at,
            updated_at: controller.updated_at,
            expires_at: controller.expires_at,
            scope: match controller.scope {
                ControllerScope::Write => JsControllerScope::Write,
                ControllerScope::Admin => JsControllerScope::Admin,
            },
        })
    }

    pub fn to_controller(&self) -> JsResult<Controller> {
        Ok(Controller {
            metadata: self
                .metadata
                .iter()
                .map(|JsMetadata(key, value)| (key.clone(), value.clone()))
                .collect(),
            created_at: self.created_at,
            updated_at: self.updated_at,
            expires_at: self.expires_at,
            scope: match self.scope {
                JsControllerScope::Write => ControllerScope::Write,
                JsControllerScope::Admin => ControllerScope::Admin,
            },
        })
    }
}

impl<'js> JsControllers<'js> {
    pub fn from_controllers(ctx: &Ctx<'js>, controllers: Controllers) -> JsResult<Self> {
        let records = controllers
            .into_iter()
            .map(|(id, controller)| {
                Ok(JsControllerRecord(
                    JsRawPrincipal::from_principal(ctx, &id)?,
                    JsController::from_controller(ctx, controller)?,
                ))
            })
            .collect::<JsResult<Vec<JsControllerRecord<'js>>>>()?;

        Ok(Self(records))
    }
}

impl<'js> JsControllers<'js> {
    pub fn to_controllers(&self) -> JsResult<Controllers> {
        self.0
            .iter()
            .map(|JsControllerRecord(id, controller)| {
                Ok((id.to_principal()?, controller.to_controller()?))
            })
            .collect()
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsControllerScope {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let s = match self {
            JsControllerScope::Write => "write",
            JsControllerScope::Admin => "admin",
        };

        s.into_js(ctx)
    }
}

impl<'js> IntoJs<'js> for JsController {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        obj.set("metadata", self.metadata.into_js(ctx))?;

        obj.set("created_at", into_bigint_js(ctx, self.created_at))?;
        obj.set("updated_at", into_bigint_js(ctx, self.updated_at))?;

        obj.set("expires_at", into_optional_bigint_js(ctx, self.expires_at)?)?;

        obj.set("scope", self.scope)?;

        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsControllerRecord<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0.into_js(ctx))?;
        arr.set(1, self.1.into_js(ctx))?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsMetadata {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0)?;
        arr.set(1, self.1)?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsControllers<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        for (i, record) in self.0.into_iter().enumerate() {
            arr.set(i, record.into_js(ctx)?)?;
        }
        Ok(arr.into_value())
    }
}

// ---------------------------------------------------------
// FromJs
// ---------------------------------------------------------

impl<'js> FromJs<'js> for JsControllerScope {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let s: String = String::from_js(ctx, value)?;

        match s.as_str() {
            "write" => Ok(Self::Write),
            "admin" => Ok(Self::Admin),
            _ => Err(JsError::new_from_js("JsControllerScope", "ControllerScope")),
        }
    }
}

impl<'js> FromJs<'js> for JsMetadata {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let key = arr.get(0)?;
        let value = arr.get(1)?;

        Ok(Self(key, value))
    }
}

impl<'js> FromJs<'js> for JsController {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let raw_metadata: Vec<JsMetadata> = obj.get("metadata")?;
        let metadata = raw_metadata.into_iter().collect();

        let created_at: Timestamp = from_bigint_js(obj.get("created_at")?)?;

        let updated_at: Timestamp = from_bigint_js(obj.get("updated_at")?)?;

        // TODO: replace Option<u64> with Option<Timestamp>
        let expires_at: Option<u64> =
            from_optional_bigint_js(obj.get::<_, Option<BigInt>>("expires_at")?)?;

        let scope = JsControllerScope::from_js(ctx, obj.get("scope")?)?;

        Ok(Self {
            metadata,
            created_at,
            updated_at,
            expires_at,
            scope,
        })
    }
}

impl<'js> FromJs<'js> for JsControllerRecord<'js> {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let principal = JsRawPrincipal::from_js(ctx, arr.get(0)?)?;
        let controller = JsController::from_js(ctx, arr.get(1)?)?;

        Ok(Self(principal, controller))
    }
}

impl<'js> FromJs<'js> for JsControllers<'js> {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let mut records = Vec::with_capacity(arr.len());

        for i in 0..arr.len() {
            let val: Value = arr.get(i)?;
            let record = JsControllerRecord::from_js(ctx, val)?;
            records.push(record);
        }

        Ok(Self(records))
    }
}
