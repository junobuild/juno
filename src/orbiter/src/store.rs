use crate::memory::STATE;
use crate::types::interface::SetPageView;
use crate::types::state::{PageView, PageViewsStable, AnalyticKey};
use ic_cdk::api::time;
use shared::assert::assert_timestamp;

pub fn insert_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    STATE.with(|state| {
        insert_page_view_impl(key, page_view, &mut state.borrow_mut().stable.page_views)
    })
}

fn insert_page_view_impl(
    key: AnalyticKey,
    page_view: SetPageView,
    db: &mut PageViewsStable,
) -> Result<PageView, String> {
    let current_page_view = db.get(&key);

    // Validate timestamp
    match current_page_view.clone() {
        None => (),
        Some(current_page_view) => {
            match assert_timestamp(page_view.updated_at, current_page_view.updated_at) {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }

    let now = time();

    let created_at: u64 = match current_page_view {
        None => now,
        Some(current_page_view) => current_page_view.created_at,
    };

    let new_page_view: PageView = PageView {
        title: page_view.title,
        href: page_view.href,
        referrer: page_view.referrer,
        device: page_view.device,
        user_agent: page_view.user_agent,
        time_zone: page_view.time_zone,
        collected_at: page_view.collected_at,
        created_at,
        updated_at: now,
    };

    db.insert(key.clone(), new_page_view.clone());

    Ok(new_page_view.clone())
}
