use crate::types::state::SegmentKind;
use crate::types::utils::CalendarDate;
use std::fmt::{Display, Formatter, Result};
use time::Month;

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
