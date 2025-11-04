const MINUTE_NANOSECONDS = 60n * 1_000_000_000n;
const HOUR_NANOSECONDS = 60n * MINUTE_NANOSECONDS;
const DAY_NANOSECONDS = 24n * HOUR_NANOSECONDS;

// 1 day in nanoseconds
export const AN_HOUR_NS = HOUR_NANOSECONDS;
export const TWO_HOURS_NS = 2n * AN_HOUR_NS;
export const FOUR_HOURS_NS = 4n * AN_HOUR_NS;
export const EIGHT_HOURS_NS = 8n * AN_HOUR_NS;
export const HALF_DAY_NS = 12n * AN_HOUR_NS;
export const ONE_DAY_NS = DAY_NANOSECONDS;
export const A_WEEK_NS = 7n * ONE_DAY_NS;
export const TWO_WEEKS_NS = 2n * A_WEEK_NS;
export const A_MONTH_NS = 30n * ONE_DAY_NS; // 30 days. Max.

export const AUTH_DEFAULT_MAX_SESSION_TIME_TO_LIVE = DAY_NANOSECONDS;

export const GOOGLE_CLIENT_ID_REGEX = /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
