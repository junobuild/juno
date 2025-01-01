use crate::memory::init_stable_state;
use crate::types::interface::SendNotification;
use crate::types::state::{
    DepositedCyclesEmailNotification, HeapState, Notification, NotificationKey, NotificationStatus,
    State,
};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use std::borrow::Cow;

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
        }
    }
}

impl Storable for Notification {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for NotificationKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Notification {
    pub fn from_send(send_notification: &SendNotification) -> Self {
        match send_notification {
            SendNotification::DepositedCyclesEmail(send_email) => {
                Notification::DepositedCyclesEmail(DepositedCyclesEmailNotification {
                    to: send_email.to.clone(),
                    metadata: send_email.metadata.clone(),
                    deposited_cycles: send_email.deposited_cycles.clone(),
                    status: NotificationStatus::Pending,
                    updated_at: time(),
                })
            }
        }
    }

    pub fn failed(current_notification: &Notification) -> Self {
        match current_notification {
            Notification::DepositedCyclesEmail(email_notification) => {
                Notification::DepositedCyclesEmail(DepositedCyclesEmailNotification {
                    status: NotificationStatus::Failed,
                    updated_at: time(),
                    ..email_notification.clone()
                })
            }
        }
    }

    pub fn sent(current_notification: &Notification) -> Self {
        match current_notification {
            Notification::DepositedCyclesEmail(email_notification) => {
                Notification::DepositedCyclesEmail(DepositedCyclesEmailNotification {
                    status: NotificationStatus::Sent,
                    updated_at: time(),
                    ..email_notification.clone()
                })
            }
        }
    }
}
