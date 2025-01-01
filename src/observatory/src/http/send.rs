use crate::http::request::post_email;
use crate::http::types::EmailRequestBody;
use crate::store::heap::get_email_api_key;
use crate::store::stable::{get_notification, set_notification};
use crate::types::state::{
    DepositedCyclesEmailNotification, Notification, NotificationKey, NotificationKind,
};
use ic_cdk::trap;

pub async fn send_notification(key: NotificationKey) {
    let notification = get_notification(&key).unwrap_or_else(|| trap("Notification not found."));

    let result = match &notification.kind {
        NotificationKind::DepositedCyclesEmail(email) => {
            send_email(&key, &email.to, &notification).await
        }
    };

    let updated_notification = match result {
        Ok(_) => Notification::sent(&notification),
        Err(_) => Notification::failed(&notification),
    };

    set_notification(&key, &updated_notification);
}

pub async fn send_email(
    key: &NotificationKey,
    to: &String,
    notification: &Notification,
) -> Result<(), String> {
    let idempotency_key = key.idempotency_key();
    let api_key = get_email_api_key()?;

    let email = EmailRequestBody {
        to: to.clone(),
        title: notification.title(),
        content: notification.content(),
    };

    post_email(&idempotency_key, &api_key, &email).await
}
