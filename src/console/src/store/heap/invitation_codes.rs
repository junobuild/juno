use crate::store::mutate_heap_state;
use crate::types::state::{InvitationCode, InvitationCodeRedeem, InvitationCodes};
use ic_cdk::api::time;
use junobuild_shared::types::state::UserId;

#[allow(dead_code)]
pub fn add_invitation_code(code: &InvitationCode) {
    mutate_heap_state(|heap| add_invitation_code_impl(code, &mut heap.invitation_codes))
}

#[allow(dead_code)]
pub fn redeem_invitation_code(user_id: &UserId, code: &InvitationCode) -> Result<(), &'static str> {
    mutate_heap_state(|heap| redeem_invitation_code_impl(user_id, code, &mut heap.invitation_codes))
}

fn redeem_invitation_code_impl(
    user_id: &UserId,
    code: &InvitationCode,
    invitation_codes: &mut InvitationCodes,
) -> Result<(), &'static str> {
    let redeem = invitation_codes.get(code);

    match redeem {
        None => Err("Not a valid invitation code."),
        Some(redeem) => {
            if redeem.redeemed {
                return Err("Invitation code has already been used.");
            }

            let now = time();

            let mark_redeemed = InvitationCodeRedeem {
                redeemed: true,
                updated_at: now,
                created_at: redeem.created_at,
                user_id: Some(*user_id),
            };

            invitation_codes.insert(code.clone(), mark_redeemed);

            Ok(())
        }
    }
}

fn add_invitation_code_impl(code: &InvitationCode, invitation_codes: &mut InvitationCodes) {
    let now = time();

    let redeem = InvitationCodeRedeem {
        redeemed: false,
        updated_at: now,
        created_at: now,
        user_id: None,
    };

    invitation_codes.insert(code.clone(), redeem);
}
