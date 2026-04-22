use crate::state::types::automation::AutomationConfig;
use crate::state::types::interface::SetAutomationConfig;
use junobuild_shared::assert::assert_version;
use junobuild_shared::types::state::Version;

pub fn assert_set_automation_config(
    proposed_config: &SetAutomationConfig,
    current_config: &Option<AutomationConfig>,
) -> Result<(), String> {
    assert_config_version(current_config, proposed_config.version)?;

    Ok(())
}

fn assert_config_version(
    current_config: &Option<AutomationConfig>,
    proposed_version: Option<Version>,
) -> Result<(), String> {
    if let Some(cfg) = current_config {
        assert_version(proposed_version, cfg.version)?
    }

    Ok(())
}
