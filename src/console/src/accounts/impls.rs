use crate::constants::E8S_PER_ICP;
use crate::types::state::{Account, OpenIdData, Provider};
use ic_cdk::api::time;
use junobuild_auth::openid::user::types::interface::OpenIdCredential;
use junobuild_auth::profile::types::OpenIdProfile;
use junobuild_shared::types::state::{MissionControlId, UserId};

impl OpenIdProfile for OpenIdData {
    fn email(&self) -> Option<&str> {
        self.email.as_deref()
    }
    fn name(&self) -> Option<&str> {
        self.name.as_deref()
    }
    fn given_name(&self) -> Option<&str> {
        self.given_name.as_deref()
    }
    fn family_name(&self) -> Option<&str> {
        self.family_name.as_deref()
    }
    fn preferred_username(&self) -> Option<&str> {
        self.preferred_username.as_deref()
    }
    fn picture(&self) -> Option<&str> {
        self.picture.as_deref()
    }
    fn locale(&self) -> Option<&str> {
        self.locale.as_deref()
    }
}

impl OpenIdData {
    pub fn merge(existing: &OpenIdData, credential: &OpenIdCredential) -> Self {
        Self {
            email: credential.email.clone().or(existing.email.clone()),
            name: credential.name.clone().or(existing.name.clone()),
            given_name: credential
                .given_name
                .clone()
                .or(existing.given_name.clone()),
            family_name: credential
                .family_name
                .clone()
                .or(existing.family_name.clone()),
            preferred_username: credential
                .preferred_username
                .clone()
                .or(existing.preferred_username.clone()),
            picture: credential.picture.clone().or(existing.picture.clone()),
            locale: credential.locale.clone().or(existing.locale.clone()),
        }
    }
}

impl From<&OpenIdCredential> for OpenIdData {
    fn from(credential: &OpenIdCredential) -> Self {
        Self {
            email: credential.email.clone(),
            name: credential.name.clone(),
            given_name: credential.given_name.clone(),
            family_name: credential.family_name.clone(),
            preferred_username: credential.preferred_username.clone(),
            picture: credential.picture.clone(),
            locale: credential.locale.clone(),
        }
    }
}

impl Account {
    pub fn init(user: &UserId, provider: &Option<Provider>) -> Self {
        let now = time();

        Account {
            mission_control_id: None,
            provider: provider.clone(),
            owner: *user,
            credits: E8S_PER_ICP,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn set_provider(&self, provider: &Provider) -> Self {
        Self {
            provider: Some(provider.clone()),
            updated_at: time(),
            ..*self
        }
    }

    pub fn set_mission_control_id(&self, mission_control_id: &MissionControlId) -> Self {
        Self {
            mission_control_id: Some(*mission_control_id),
            updated_at: time(),
            ..self.clone()
        }
    }
}
