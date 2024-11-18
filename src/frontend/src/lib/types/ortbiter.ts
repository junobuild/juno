import type {
	AnalyticsBrowsersPageViews,
	AnalyticsDevicesPageViews,
	AnalyticsMetricsPageViews,
	AnalyticsTop10PageViews,
	OrbiterSatelliteConfig as SatelliteConfig
} from '$declarations/orbiter/orbiter.did';
import type { OptionIdentity, PrincipalText } from '$lib/types/itentity';
import { Principal } from '@dfinity/principal';

export interface PageViewsPeriod {
	from?: Date;
	to?: Date;
}

export type PageViewsParams = {
	satelliteId?: Principal;
	orbiterId: Principal;
	identity: OptionIdentity;
} & PageViewsPeriod;

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
