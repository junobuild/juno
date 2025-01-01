use crate::memory::init_stable_state;
use crate::types::interface::NotifyArgs;
use crate::types::state::{
    HeapState, Notification, NotificationKey, NotificationKind, NotificationStatus, State,
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
    pub fn from_args(args: &NotifyArgs) -> Self {
        Notification {
            segment: args.segment.clone(),
            kind: args.kind.clone(),
            status: NotificationStatus::Pending,
            updated_at: time(),
        }
    }

    pub fn failed(current_notification: &Notification) -> Self {
        Notification {
            status: NotificationStatus::Failed,
            updated_at: time(),
            ..current_notification.clone()
        }
    }

    pub fn sent(current_notification: &Notification) -> Self {
        Notification {
            status: NotificationStatus::Sent,
            updated_at: time(),
            ..current_notification.clone()
        }
    }

    pub fn title(&self) -> String {
        match &self.kind {
            NotificationKind::DepositedCyclesEmail(email_notification) => {
                let t_cycles =
                    email_notification.deposited_cycles.amount as f64 / 1_000_000_000_000.0;

                // Format with 8 decimals
                let formatted = format!("{:.8}", t_cycles);

                // Trim leading zeros
                let formatted_cycles = formatted
                    .trim_end_matches('0')
                    .trim_end_matches('.')
                    .to_string();

                format!(
                    "🚀 {} T Cycles Deposited on Your {}",
                    formatted_cycles, self.segment.kind
                )
            }
        }
    }
}
