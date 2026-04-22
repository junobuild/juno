use crate::auth::strategy_impls::AuthHeap;
use junobuild_auth::state::types::automation::AutomationConfig;
use junobuild_auth::state::types::interface::SetAutomationConfig;
use junobuild_auth::state::{
    get_automation as get_state_automation, set_automation_config as set_store_automation_config,
};

pub async fn set_config(proposed_config: &SetAutomationConfig) -> Result<AutomationConfig, String> {
    set_store_automation_config(&AuthHeap, proposed_config)
}

pub fn get_config() -> Option<AutomationConfig> {
    get_state_automation(&AuthHeap)
}
