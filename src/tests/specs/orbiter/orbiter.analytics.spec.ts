import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	OrbiterSatelliteFeatures,
	PageView,
	PageViewClient,
	SetPageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, isNullish, jsonReviver, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import UAParser from 'ua-parser-js';
import { inject } from 'vitest';
import { satelliteIdMock } from '../../mocks/orbiter.mocks';
import { tick } from '../../utils/pic-tests.utils';
import { controllersInitArgs, ORBITER_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Orbiter > Analytics', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	let pageViewsMock: [AnalyticKey, PageView][];

	const ONE_DAY = 86_400_000_000_000n;

	const initMock = async () => {
		const content = await readFile(
			join(process.cwd(), 'src', 'tests/mocks/analytics.mocks.json'),
			'utf-8'
		);
		pageViewsMock = JSON.parse(content, jsonReviver);
	};

	const initConfig = async () => {
		const allFeatures: OrbiterSatelliteFeatures = {
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

	const uploadPageViews = async ({
		collected_at,
		withSizeMock = false,
		withUAParser = false
	}: {
		collected_at: bigint;
		withSizeMock?: boolean;
		withUAParser?: boolean;
	}) => {
		const screen_width = [575, 991, 1439, 1920];

		const setPageViewsData = pageViewsMock.map<[AnalyticKey, SetPageView]>(
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
						...value
					}
				],
				i
			) => {
				const parseClient = (): PageViewClient | undefined => {
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
						}
					}
				];
			}
		);

		const it = setPageViewsData.values();
		const chunks: [AnalyticKey, SetPageView][][] = Array.from(it, (val) => [
			val,
			...it.take(50 - 1)
		]);

		const { set_page_views } = actor;

		for (const chunk of chunks) {
			await set_page_views(chunk);

			await tick(pic);
		}
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);

		await initConfig();

		await initMock();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Analytics with fallback', () => {
		const collected_at = 1742076030479000000n;

		beforeAll(async () => {
			await uploadPageViews({ collected_at });
		});

		it('should get page views metrics', async () => {
			const { get_page_views_analytics_metrics } = actor;

			const result = await get_page_views_analytics_metrics({
				satellite_id: [satelliteIdMock],
				from: [collected_at],
				to: [collected_at + 1000n]
			});

			const totalPageViews = pageViewsMock.length;
			const uniqueSessions = [...new Set(pageViewsMock.map(([_, { session_id }]) => session_id))]
				.length;

			let sessionsUniqueViews: Record<string, Set<string>> = {};
			let sessionsViews: Record<string, number> = {};

			for (const [_, { session_id, href }] of pageViewsMock) {
				const updatedSet = sessionsUniqueViews[session_id] ?? new Set();
				updatedSet.add(href);

				sessionsUniqueViews = {
					...sessionsUniqueViews,
					[session_id]: updatedSet
				};

				sessionsViews = {
					...sessionsViews,
					[session_id]: (sessionsViews[session_id] ?? 0) + 1
				};
			}

			const singlePageViewSessions = Object.values(sessionsViews).filter(
				(value) => value === 1
			).length;
			const bounceRate =
				Object.keys(sessionsViews).length > 0
					? singlePageViewSessions / Object.keys(sessionsViews).length
					: 0;

			const uniquePageViews = Object.values(sessionsUniqueViews).reduce(
				(acc, value) => acc + value.size,
				0
			);

			// In this test all page views are collected the same day so for simplicity reasons its the same value.
			const dailyTotalPageViews = totalPageViews;
			const averagePageViewsPerSession = dailyTotalPageViews / uniqueSessions;

			expect(result).toEqual({
				bounce_rate: bounceRate,
				average_page_views_per_session: averagePageViewsPerSession,
				daily_total_page_views: [
					[
						{
							day: 15,
							month: 3,
							year: 2025
						},
						dailyTotalPageViews
					]
				],
				total_page_views: totalPageViews,
				unique_page_views: BigInt(uniquePageViews),
				unique_sessions: BigInt(uniqueSessions)
			});
		});

		it('should get the top10 pages', async () => {
			const { get_page_views_analytics_top_10 } = actor;

			const result = await get_page_views_analytics_top_10({
				satellite_id: [satelliteIdMock],
				from: [collected_at],
				to: [collected_at + 1000n]
			});

			expect(result).toEqual({
				pages: [
					['/', 92],
					['/hello/', 26],
					['/info/', 17],
					['/explore/', 13],
					['/coolio/', 8],
					['/settings/', 5]
				],
				referrers: [
					['demo.com', 30],
					['source.com', 15],
					['com.twitter.android', 7],
					['www.google.com', 1]
				]
			});
		});

		it('should get the clients information', async () => {
			const { get_page_views_analytics_clients } = actor;

			const result = await get_page_views_analytics_clients({
				satellite_id: [satelliteIdMock],
				from: [collected_at],
				to: [collected_at + 1000n]
			});

			expect(result).toEqual({
				browsers: {
					chrome: 0.5962732919254659,
					firefox: 0.037267080745341616,
					opera: 0,
					others: 0,
					safari: 0.36645962732919257
				},
				devices: {
					desktop: 0.6273291925465838,
					laptop: toNullable(0),
					mobile: 0.37267080745341613,
					tablet: toNullable(0),
					others: 0
				},
				operating_systems: []
			});
		});
	});

	describe('Analytics with screen data', () => {
		const collected_at = 1742076030479000000n + ONE_DAY;

		beforeAll(async () => {
			await uploadPageViews({ collected_at, withSizeMock: true });
		});

		it('should get the clients information', async () => {
			const { get_page_views_analytics_clients } = actor;

			const result = await get_page_views_analytics_clients({
				satellite_id: [satelliteIdMock],
				from: [collected_at],
				to: [collected_at + 1000n]
			});

			expect(result).toEqual({
				browsers: {
					chrome: 0.5962732919254659,
					firefox: 0.037267080745341616,
					opera: 0,
					others: 0,
					safari: 0.36645962732919257
				},
				devices: {
					desktop: 0.2484472049689441,
					laptop: toNullable(0.2484472049689441),
					mobile: 0.2546583850931677,
					tablet: toNullable(0.2484472049689441),
					others: 0
				},
				operating_systems: []
			});
		});
	});

	describe('Analytics with UA parsed data', () => {
		const collected_at = 1742076030479000000n + ONE_DAY + ONE_DAY;

		beforeAll(async () => {
			await uploadPageViews({ collected_at, withUAParser: true });
		});

		it('should get the data based on extract ua data', async () => {
			const { get_page_views_analytics_clients } = actor;

			const result = await get_page_views_analytics_clients({
				satellite_id: [satelliteIdMock],
				from: [collected_at],
				to: [collected_at + 1000n]
			});

			expect(result).toEqual({
				browsers: {
					chrome: 0.5962732919254659,
					firefox: 0.037267080745341616,
					opera: 0,
					others: 0,
					safari: 0.36645962732919257
				},
				devices: {
					desktop: 0.6894409937888198,
					laptop: toNullable(0),
					mobile: 0.3105590062111801,
					tablet: toNullable(0),
					others: 0
				},
				operating_systems: [
					{
						android: 0.3105590062111801,
						ios: 0.37267080745341613,
						linux: 0,
						macos: 0.13043478260869565,
						others: 0.006211180124223602,
						windows: 0.18012422360248448
					}
				]
			});
		});
	});

	describe('Analytics with UA parsed data and screen size', () => {
		const collected_at = 1742076030479000000n + ONE_DAY + ONE_DAY + ONE_DAY;

		beforeAll(async () => {
			await uploadPageViews({ collected_at, withUAParser: true, withSizeMock: true });
		});

		it('should get the data based on extract ua data except devices from size', async () => {
			const { get_page_views_analytics_clients } = actor;

			const result = await get_page_views_analytics_clients({
				satellite_id: [satelliteIdMock],
				from: [collected_at],
				to: [collected_at + 1000n]
			});

			expect(result).toEqual({
				browsers: {
					chrome: 0.5962732919254659,
					firefox: 0.037267080745341616,
					opera: 0,
					others: 0,
					safari: 0.36645962732919257
				},
				devices: {
					desktop: 0.2484472049689441,
					laptop: toNullable(0.2484472049689441),
					mobile: 0.2546583850931677,
					tablet: toNullable(0.2484472049689441),
					others: 0
				},
				operating_systems: [
					{
						android: 0.3105590062111801,
						ios: 0.37267080745341613,
						linux: 0,
						macos: 0.13043478260869565,
						others: 0.006211180124223602,
						windows: 0.18012422360248448
					}
				]
			});
		});
	});
});
