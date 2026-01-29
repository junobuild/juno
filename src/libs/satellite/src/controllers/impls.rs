use crate::controllers::types::AutomationScope;
use junobuild_shared::types::state::ControllerScope;

impl From<AutomationScope> for ControllerScope {
    fn from(scope: AutomationScope) -> Self {
        match scope {
            AutomationScope::Write => ControllerScope::Write,
            AutomationScope::Submit => ControllerScope::Submit,
        }
    }
}
