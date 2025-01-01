use crate::http::request::post_email;
use crate::store::heap::get_email_api_key;
use crate::store::stable::{get_notification, set_notification};
use crate::types::state::{DepositedCyclesEmailNotification, Notification, NotificationKey};
use ic_cdk::trap;

pub async fn send_notification(key: NotificationKey) {
    let notification = get_notification(&key).unwrap_or_else(|| trap("Notification not found."));

    #[allow(irrefutable_let_patterns)]
    if let Notification::DepositedCyclesEmail(ref email) = notification {
        let result = send_email(&key, email).await;

        let updated_notification = match result {
            Ok(_) => Notification::sent(&notification),
            Err(_) => Notification::failed(&notification),
        };

        set_notification(&key, &updated_notification);
    }
}

pub async fn send_email(
    key: &NotificationKey,
    email: &DepositedCyclesEmailNotification,
) -> Result<(), String> {
    let email_api_key = get_email_api_key()?;

    post_email(key, email, &email_api_key).await
}
