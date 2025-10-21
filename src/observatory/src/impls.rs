use crate::memory::init_stable_state;
use crate::templates::{
    DEPOSITED_CYCLES_HTML, DEPOSITED_CYCLES_TXT, FAILED_DEPOSIT_CYCLES_HTML,
    FAILED_DEPOSIT_CYCLES_TXT,
};
use crate::types::interface::NotifyStatus;
use crate::types::state::{
    HeapState, Notification, NotificationKey, NotificationStatus, OpenIdCertificate,
    OpenIdProvider, State,
};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_auth::openid::jwt::types::cert::Jwks;
use junobuild_shared::serializers::{
    deserialize_from_bytes, serialize_into_bytes, serialize_to_bytes,
};
use junobuild_shared::types::interface::NotifyArgs;
use junobuild_shared::types::state::{NotificationKind, SegmentKind, Version, Versioned};
use junobuild_shared::version::next_version;
use std::borrow::Cow;
use std::fmt::{Display, Formatter, Result as FmtResult};
use time::OffsetDateTime;

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
        }
    }
}

impl Storable for Notification {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for NotificationKey {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl NotificationKey {
    pub fn idempotency_key(&self) -> String {
        format!(
            "{}___{}___{}",
            self.segment_id.to_text(),
            self.created_at,
            self.nonce
        )
    }
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

    fn format_cycles(amount: u128) -> String {
        let t_cycles = amount as f64 / 1_000_000_000_000.0;

        // Format with 8 decimals
        let formatted = format!("{t_cycles:.8}");

        // Trim leading zeros
        let formatted_cycles = formatted
            .trim_end_matches('0')
            .trim_end_matches('.')
            .to_string();

        formatted_cycles
    }

    fn format_timestamp(ts_nanos: u64) -> Result<String, String> {
        let dt_offset = OffsetDateTime::from_unix_timestamp_nanos(ts_nanos as i128)
            .unwrap_or(OffsetDateTime::UNIX_EPOCH);

        let format =
            time::format_description::parse("[year]-[month]-[day]T[hour]:[minute]:[second]+00:00")
                .map_err(|err| format!("Failed to parse format description: {err}"))?;

        dt_offset
            .format(&format)
            .map_err(|err| format!("Failed to format timestamp: {err}"))
    }

    fn segment_url(&self) -> String {
        match self.segment.kind {
            SegmentKind::Orbiter => "https://console.juno.build/analytics".to_string(),
            SegmentKind::MissionControl => "https://console.juno.build/mission-control".to_string(),
            SegmentKind::Satellite => format!(
                "https://console.juno.build/satellite/?s={}",
                self.segment.id
            ),
        }
    }

    pub fn title(&self) -> String {
        match &self.kind {
            NotificationKind::DepositedCyclesEmail(email_notification) => {
                let formatted_cycles =
                    Self::format_cycles(email_notification.deposited_cycles.amount);

                format!(
                    "🚀 {} T Cycles Deposited on Your {}",
                    formatted_cycles, self.segment.kind
                )
            }
            NotificationKind::FailedCyclesDepositEmail(_email_notification) => {
                format!("❗️Cycles Deposit Failed on Your {}", self.segment.kind)
            }
        }
    }

    fn content(&self, template: &str) -> String {
        let (timestamp, deposited_cycles_amount) = match &self.kind {
            NotificationKind::DepositedCyclesEmail(email_notification) => (
                email_notification.deposited_cycles.timestamp,
                Some(email_notification.deposited_cycles.amount),
            ),
            NotificationKind::FailedCyclesDepositEmail(email_notification) => {
                (email_notification.funding_failure.timestamp, None)
            }
        };

        let formatted_timestamp =
            Self::format_timestamp(timestamp).unwrap_or_else(|_| "Invalid timestamp".to_string());

        let mut content = template
            .replace("{{module}}", &self.segment.kind.to_string())
            .replace("{{timestamp}}", &formatted_timestamp)
            .replace("{{url}}", &self.segment_url());

        if let Some(amount) = deposited_cycles_amount {
            let formatted_cycles = Self::format_cycles(amount);
            content = content.replace("{{cycles}}", &formatted_cycles);
        }

        let name = self
            .segment
            .metadata
            .as_ref()
            .and_then(|metadata| metadata.get("name"));

        content = match name {
            Some(name) => content.replace("{{name}}", name),
            None => content
                .replace(" (<!-- -->{{name}}<!-- -->)", "")
                .replace(" ({{name}})", ""),
        };

        content
    }

    pub fn html(&self) -> String {
        match &self.kind {
            NotificationKind::DepositedCyclesEmail(_email_notification) => {
                let template = String::from_utf8_lossy(DEPOSITED_CYCLES_HTML);
                self.content(&template)
            }
            NotificationKind::FailedCyclesDepositEmail(_email_notification) => {
                let template = String::from_utf8_lossy(FAILED_DEPOSIT_CYCLES_HTML);
                self.content(&template)
            }
        }
    }

    pub fn text(&self) -> String {
        match &self.kind {
            NotificationKind::DepositedCyclesEmail(_email_notification) => {
                let template = String::from_utf8_lossy(DEPOSITED_CYCLES_TXT);
                self.content(&template)
            }
            NotificationKind::FailedCyclesDepositEmail(_email_notification) => {
                let template = String::from_utf8_lossy(FAILED_DEPOSIT_CYCLES_TXT);
                self.content(&template)
            }
        }
    }
}

impl NotifyStatus {
    pub fn from_notifications(notifications: &Vec<(NotificationKey, Notification)>) -> Self {
        let mut pending = 0;
        let mut sent = 0;
        let mut failed = 0;

        for (_, notification) in notifications {
            match notification.status {
                NotificationStatus::Pending => pending += 1,
                NotificationStatus::Sent => sent += 1,
                NotificationStatus::Failed => failed += 1,
            }
        }

        NotifyStatus {
            pending,
            sent,
            failed,
        }
    }
}

impl OpenIdProvider {
    pub fn jwks_url(&self) -> &'static str {
        match self {
            Self::Google => "https://www.googleapis.com/oauth2/v3/certs",
        }
    }
}

impl Versioned for OpenIdCertificate {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

impl OpenIdCertificate {
    fn get_next_version(current_certificate: &Option<OpenIdCertificate>) -> Version {
        next_version(current_certificate)
    }

    pub fn init(jwks: &Jwks) -> Self {
        let now = time();

        let version = Self::get_next_version(&None);

        Self {
            jwks: jwks.clone(),
            // TODO
            expires_at: now,
            created_at: now,
            updated_at: now,
            version: Some(version),
        }
    }

    pub fn update(current_certificate: &OpenIdCertificate, jwks: &Jwks) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_certificate.clone()));

        Self {
            jwks: jwks.clone(),
            // TODO: expires_at
            updated_at: now,
            version: Some(version),
            ..current_certificate.clone()
        }
    }
}

impl Display for OpenIdProvider {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        match self {
            OpenIdProvider::Google => write!(f, "Google"),
        }
    }
}
