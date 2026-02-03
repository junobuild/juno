use crate::automation::workflow::types::state::{AutomationWorkflowKey};

impl AutomationWorkflowKey {
    pub fn to_key(&self) -> String {
        format!(
            "{}#{}#{}",
            self.provider.to_string(),
            self.repository,
            self.run_id
        )
    }
}