import type {
	AnalyticsBrowsersPageViews,
	AnalyticsDevicesPageViews,
	AnalyticsMetricsPageViews,
	AnalyticsOperatingSystemsPageViews,
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

export type PageViewsPeriods = Required<PageViewsPeriod>[];

export type PageViewsFilters = Partial<PageViewsPeriod> & { periodicity: AnalyticsPeriodicity };

// One day = 24 hours
// A week = 7 days = 168 hours
// A month = 30 days = 720 hours
export type AnalyticsPeriodicity = 4 | 8 | 12 | 24 | 168 | 720;

export type PageViewsParams = {
	satelliteId?: Principal;
	orbiterId: Principal;
	identity: OptionIdentity;
} & Omit<PageViewsFilters, 'from'> &
	Required<Pick<PageViewsFilters, 'from'>>;

export type DateStartOfTheDay = string;

export type AnalyticsMetrics = Omit<AnalyticsMetricsPageViews, 'daily_total_page_views'> & {
	daily_total_page_views: Record<DateStartOfTheDay, number>;
};

export interface AnalyticsClients {
	devices: AnalyticsDevicesPageViews;
	browsers?: AnalyticsBrowsersPageViews;
	operating_systems?: AnalyticsOperatingSystemsPageViews;
}

export interface AnalyticsPageViews {
	metrics: AnalyticsMetrics;
	top10: AnalyticsTop10PageViews;
	clients: AnalyticsClients;
}

export interface OrbiterSatelliteConfigEntry {
	name: string;
	enabled: boolean;
	config?: SatelliteConfig;
}

export type OrbiterIdText = PrincipalText;
