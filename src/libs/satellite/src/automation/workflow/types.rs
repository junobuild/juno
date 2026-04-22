pub mod state {
    use candid::Deserialize;
    use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
    use serde::Serialize;

    /// A unique key for identifying an automation workflow.
    /// The key will be parsed to `provider#repository#id`.
    #[derive(Serialize, Deserialize)]
    pub struct AutomationWorkflowKey {
        pub provider: OpenIdAutomationProvider,
        pub repository: String,
        pub run_id: String, // e.g. run_id for GitHub, pipeline_id for GitLab
    }

    /// Deployment workflow metadata.
    /// Stores the latest state if a workflow has multiple attempts.
    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct AutomationWorkflowData {
        pub run_number: Option<String>, // The number of times this workflow has been run.
        pub run_attempt: Option<String>, // The number of times this workflow run has been retried.
        pub r#ref: Option<String>, // (Reference) The latest git ref that triggered the workflow run. e.g. "refs/heads/main"
        pub sha: Option<String>,   // The commit SHA that triggered the workflow
        pub actor: Option<String>, // The user who triggered the workflow
        pub workflow: Option<String>, // The workflow name
        pub event_name: Option<String>, // What triggered the workflow (push, workflow_dispatch, pull_request, etc.)
    }
}
