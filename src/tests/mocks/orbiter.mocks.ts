import type { SetPageView, SetTrackEvent } from '$declarations/orbiter/orbiter.did';
import { Principal } from '@dfinity/principal';
import { nanoid } from 'nanoid';

export const satelliteIdMock = Principal.fromText('ck4tp-3iaaa-aaaal-ab7da-cai');

const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

export const pageViewMock: SetPageView = {
	href: 'https://test.com',
	device: {
		inner_height: 300,
		inner_width: 600
	},
	satellite_id: satelliteIdMock,
	referrer: [],
	session_id: nanoid(),
	title: 'Test',
	time_zone: timeZone,
	user_agent: [
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
	],
	updated_at: []
};

export const trackEventMock: SetTrackEvent = {
	name: 'my_event',
	metadata: [],
	satellite_id: satelliteIdMock,
	session_id: nanoid(),
	user_agent: [
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
	],
	updated_at: []
};
