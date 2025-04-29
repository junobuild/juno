import type {
	AnalyticsBrowsersPageViews,
	AnalyticsDevicesPageViews,
	AnalyticsMetricsPageViews,
	AnalyticsTop10PageViews,
	OrbiterSatelliteConfig as SatelliteConfig
} from '$declarations/orbiter/orbiter.did';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import type { PrincipalText } from '@dfinity/zod-schemas';

export interface PageViewsPeriod {
	from: Date;
	to?: Date;
}

export type PageViewsOptionPeriod = Partial<PageViewsPeriod>;

// One day = 24 hours
// A week = 7 days = 168 hours
// A month = 30 days = 720 hours
export interface AnalyticsPeriodicity {
	periodicity: 4 | 8 | 12 | 24 | 168 | 720;
}

export type PageViewsParams = {
	satelliteId?: Principal;
	orbiterId: Principal;
	identity: OptionIdentity;
} & PageViewsPeriod &
	AnalyticsPeriodicity;

export type DateStartOfTheDay = string;

export type AnalyticsMetrics = Omit<AnalyticsMetricsPageViews, 'daily_total_page_views'> & {
	daily_total_page_views: Record<DateStartOfTheDay, number>;
};

export interface AnalyticsPageViewsClients {
	devices: AnalyticsDevicesPageViews;
	browsers?: AnalyticsBrowsersPageViews;
}

export interface AnalyticsPageViews {
	metrics: AnalyticsMetrics;
	top10: AnalyticsTop10PageViews;
	clients: AnalyticsPageViewsClients;
}

export interface OrbiterSatelliteConfigEntry {
	name: string;
	enabled: boolean;
	config?: SatelliteConfig;
}

export type OrbiterIdText = PrincipalText;
