use crate::events::analytics::store::{increment_daily_page_views, increment_daily_session_views};
use crate::state::types::state::{AnalyticKey, PageView};
use crate::state::types::state::analytics::{DailyAnalyticKey, DailySessionsAnalyticKey};

pub fn update_page_view_analytics(key: &AnalyticKey, page_view: &PageView) -> Result<(), String> {
    let daily_key = DailyAnalyticKey::from_analytic_key(key)?;
    increment_daily_page_views(&daily_key, page_view)?;
    
    let daily_session_key = DailySessionsAnalyticKey::from_analytic_key_and_page_view(key, page_view)?;
    increment_daily_session_views(&daily_session_key, page_view)?;
    
    Ok(())
}

