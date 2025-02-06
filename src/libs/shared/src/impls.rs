use crate::types::state::{OrbiterSatelliteConfig, SegmentKind, Version, Versioned};
use crate::types::utils::CalendarDate;
use std::fmt::{Display, Formatter, Result};
use time::Month;
use crate::types::domain::CustomDomain;

impl From<&(i32, Month, u8)> for CalendarDate {
    fn from((year, month, day): &(i32, Month, u8)) -> Self {
        CalendarDate {
            year: *year,
            month: *month as u8,
            day: *day,
        }
    }
}

impl Display for SegmentKind {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        match self {
            SegmentKind::Satellite => write!(f, "Satellite"),
            SegmentKind::MissionControl => write!(f, "Mission Control"),
            SegmentKind::Orbiter => write!(f, "Orbiter"),
        }
    }
}

impl Versioned for CustomDomain {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

impl Versioned for &OrbiterSatelliteConfig {
    fn version(&self) -> Option<Version> {
        self.version
    }
}