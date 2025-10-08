import { type OrbiterActor } from '$lib/api/actors/actor.factory';
import type { OrbiterDid } from '$lib/types/declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, isNullish, toNullable } from '@dfinity/utils';
import UAParser from 'ua-parser-js';
import { satelliteIdMock } from '../mocks/orbiter.mocks';
import { tick } from './pic-tests.utils';

export const initOrbiterConfig = async (actor: Actor<OrbiterActor>) => {
	const allFeatures: OrbiterDid.OrbiterSatelliteFeatures = {
		page_views: true,
		performance_metrics: true,
		track_events: true
	};

	const { set_satellite_configs } = actor;

	await set_satellite_configs([
		[
			satelliteIdMock,
			{
				version: [],
				restricted_origin: [],
				features: [allFeatures]
			}
		]
	]);
};

export const uploadPageViews = async ({
	collected_at,
	withSizeMock = false,
	withUAParser = false,
	pageViewsMock,
	pic,
	actor
}: {
	collected_at: bigint;
	withSizeMock?: boolean;
	withUAParser?: boolean;
	pageViewsMock: [OrbiterDid.AnalyticKey, OrbiterDid.PageView][];
	pic: PocketIc;
	actor: Actor<OrbiterActor>;
}) => {
	const screen_width = [575, 991, 1439, 1920];

	const setPageViewsData = pageViewsMock.map<[OrbiterDid.AnalyticKey, OrbiterDid.SetPageView]>(
		(
			[
				key,
				{
					version: ___,
					created_at: _,
					updated_at: __,
					satellite_id: ____,
					device,
					user_agent,
					campaign,
					...value
				}
			],
			i
		) => {
			const parseClient = (): OrbiterDid.PageViewClient | undefined => {
				if (!withUAParser) {
					return undefined;
				}

				const userAgent = fromNullable(user_agent);

				if (isNullish(userAgent)) {
					return undefined;
				}

				const parser = new UAParser(userAgent);
				const { browser, os, device } = parser.getResult();

				if (isNullish(browser.name) || isNullish(os.name)) {
					return undefined;
				}

				return {
					browser: browser.name,
					os: os.name,
					device: toNullable(device?.type)
				};
			};

			return [
				{
					...key,
					collected_at
				},
				{
					...value,
					user_agent,
					updated_at: [],
					version: [],
					client: toNullable(parseClient()),
					satellite_id: satelliteIdMock,
					device: {
						...device,
						screen_width: withSizeMock ? [screen_width[i % screen_width.length]] : [],
						screen_height: []
					},
					campaign: campaign ?? []
				}
			];
		}
	);

	const it = setPageViewsData.values();
	const chunks: [OrbiterDid.AnalyticKey, OrbiterDid.SetPageView][][] = Array.from(it, (val) => [
		val,
		...it.take(50 - 1)
	]);

	const { set_page_views } = actor;

	for (const chunk of chunks) {
		await set_page_views(chunk);

		await tick(pic);
	}
};
