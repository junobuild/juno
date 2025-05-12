use crate::http::request::post_email;
use crate::http::types::EmailRequestBody;
use crate::store::heap::get_email_api_key;
use crate::store::stable::{get_notification, set_notification};
use crate::types::state::{Notification, NotificationKey};
use ic_cdk::trap;
use junobuild_shared::types::state::NotificationKind;

pub async fn send_notification(key: NotificationKey) {
    let notification = get_notification(&key).unwrap_or_else(|| trap("Notification not found."));

    let email_to = match &notification.kind {
        NotificationKind::DepositedCyclesEmail(email) => &email.to,
        NotificationKind::FailedCyclesDepositEmail(email) => &email.to,
    };

    let result = send_email(&key, &email_to, &notification).await;

    let updated_notification = match result {
        Ok(_) => Notification::sent(&notification),
        Err(_) => Notification::failed(&notification),
    };

    set_notification(&key, &updated_notification);
}

pub async fn send_email(
    key: &NotificationKey,
    to: &str,
    notification: &Notification,
) -> Result<(), String> {
    let idempotency_key = key.idempotency_key();
    let api_key = get_email_api_key()?;

    let email = EmailRequestBody {
        from: "Juno <notify@notifications.juno.build>".to_string(),
        to: [to.to_owned()].to_vec(),
        subject: notification.title(),
        html: notification.html(),
        text: notification.text(),
    };

    post_email(&idempotency_key, &api_key, &email).await
}
