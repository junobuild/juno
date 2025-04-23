use junobuild_utils::{DocDataBigInt, DocDataPrincipal};
use crate::state::types::state::{AnalyticKey, PageView};
use crate::types::interface::{AnalyticKeyPayload, PageViewPayload, SetPageView, SetPageViewPayload};

impl AnalyticKeyPayload {
    pub fn into_domain(self) -> AnalyticKey {
        AnalyticKey {
            collected_at: self.collected_at.value,
            key: self.key,
        }
    }
}

impl SetPageViewPayload {
    pub fn into_domain(self) -> SetPageView {
        SetPageView {
            title: self.title,
            href: self.href,
            referrer: self.referrer,
            device: self.device,
            time_zone: self.time_zone,
            user_agent: self.user_agent,
            satellite_id: self.satellite_id.value,
            session_id: self.session_id,
            updated_at: None,
            version: self.version.map(|version| version.value),
        }
    }
}

impl PageViewPayload {
    pub fn from_domain(page_view: PageView) -> Self {
        Self {
            title: page_view.title,
            href: page_view.href,
            referrer: page_view.referrer,
            device: page_view.device,
            user_agent: page_view.user_agent,
            time_zone: page_view.time_zone,
            satellite_id: DocDataPrincipal { value: page_view.satellite_id },
            session_id: page_view.session_id,
            created_at: DocDataBigInt { value: page_view.created_at },
            updated_at: DocDataBigInt { value: page_view.updated_at },
            version: page_view.version.map(|version| DocDataBigInt { value: version }),
        }
    }
}