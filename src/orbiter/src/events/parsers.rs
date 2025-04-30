use crate::state::types::state::PageViewClient;
use crate::types::interface::SetPageView;
use lazy_static::lazy_static;
use uaparser::{Parser, UserAgentParser};

const UA_PARSER_REGEXES_YAML: &[u8] = include_bytes!("../../resources/regexes.yaml");

lazy_static! {
    pub static ref UA_PARSER: Option<UserAgentParser> =
        UserAgentParser::from_bytes(UA_PARSER_REGEXES_YAML).ok();
}

pub fn parse_page_view_client(
    SetPageView { user_agent, .. }: &SetPageView,
) -> Option<PageViewClient> {
    if let (Some(ua), Some(ua_parser)) = (user_agent, UA_PARSER.as_ref()) {
        let client = ua_parser.parse(ua);

        let browser = client.user_agent.family.to_lowercase();
        let operating_system = client.os.family.to_lowercase();
        let device = client.device.family.to_lowercase();

        return Some(PageViewClient {
            browser,
            operating_system,
            device,
        });
    }

    None
}
