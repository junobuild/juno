use crate::user::webauthn::types::state::{UserWebAuthnCredentialId, UserWebAuthnIndex};
use crate::{Doc, SetDoc};

impl UserWebAuthnIndex {
    pub fn prepare_set_doc(
        credential_id: &UserWebAuthnCredentialId,
        current_doc: &Option<Doc>,
    ) -> SetDoc {
        SetDoc {
            data: vec![],
            description: Some(credential_id.clone()),
            version: current_doc.as_ref().and_then(|d| d.version),
        }
    }
}
