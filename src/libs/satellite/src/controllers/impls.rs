use crate::controllers::types::GrantableScope;
use junobuild_shared::types::state::ControllerScope;

impl From<GrantableScope> for ControllerScope {
    fn from(scope: GrantableScope) -> Self {
        match scope {
            GrantableScope::Write => ControllerScope::Write,
            GrantableScope::Submit => ControllerScope::Submit,
        }
    }
}
