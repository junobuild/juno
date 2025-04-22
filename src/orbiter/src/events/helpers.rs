use crate::assert::config::assert_page_views_enabled;
use crate::events::store::{get_satellite_config, insert_page_view};
use crate::state::types::state::{AnalyticKey, PageView};
use crate::types::interface::SetPageView;

pub fn assert_and_insert_set_page_view(
    key: AnalyticKey,
    page_view: SetPageView,
) -> Result<PageView, String> {
    assert_page_views_enabled(&get_satellite_config(&page_view.satellite_id))?;

    insert_page_view(key, page_view)
}
