import type {
	SetPageView,
	SetPerformanceMetric,
	SetTrackEvent
} from '$declarations/orbiter/orbiter.did';
import { Principal } from '@dfinity/principal';
import { nanoid } from 'nanoid';

export const satelliteIdMock = Principal.fromText('ck4tp-3iaaa-aaaal-ab7da-cai');

const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

const sessionId = nanoid();

export const pageViewMock: SetPageView = {
	href: 'https://test.com',
	device: {
		inner_height: 300,
		inner_width: 600
	},
	satellite_id: satelliteIdMock,
	referrer: [],
	session_id: sessionId,
	title: 'Test',
	time_zone: timeZone,
	user_agent: [
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
	],
	version: [],
	updated_at: []
};

export const trackEventMock: SetTrackEvent = {
	name: 'my_event',
	metadata: [
		[
			['event1', 'Lorem ipsum dolor sit amet'],
			['event2', ' Praesent congue, mauris id commodo vulputate']
		]
	],
	satellite_id: satelliteIdMock,
	session_id: sessionId,
	user_agent: [
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
	],
	version: [],
	updated_at: []
};

export const performanceMetricMock: SetPerformanceMetric = {
	session_id: sessionId,
	data: {
		WebVitalsMetric: {
			id: nanoid(),
			value: 1.23,
			navigation_type: [{ Navigate: null }],
			delta: 0.5
		}
	},
	href: 'https://test.com',
	metric_name: { LCP: null },
	satellite_id: satelliteIdMock,
	version: [],
	user_agent: [
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
	]
};
