use crate::state::types::state::AnalyticKey;
use crate::types::interface::{AnalyticKeyPayload, SetPageView, SetPageViewPayload};

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