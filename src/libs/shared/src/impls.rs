use crate::types::utils::CalendarDate;
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
