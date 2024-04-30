import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	SetPageView,
	SetTrackEvent
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	INVALID_TIMESTAMP_ERROR_MSG,
	NO_TIMESTAMP_ERROR_MSG
} from './constants/satellite-tests.constants';
import { ORBITER_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Orbiter', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const satellite_id = Principal.fromText('ck4tp-3iaaa-aaaal-ab7da-cai');

	const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

	const pageView: SetPageView = {
		href: 'https://test.com',
		device: {
			inner_height: 300,
			inner_width: 600
		},
		satellite_id,
		referrer: [],
		session_id: nanoid(),
		title: 'Test',
		time_zone: timeZone,
		user_agent: [
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
		],
		updated_at: []
	};

	const trackEvent: SetTrackEvent = {
		name: 'my_event',
		metadata: [],
		satellite_id,
		session_id: nanoid(),
		user_agent: [
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0'
		],
		updated_at: []
	};

	describe('not configured', () => {
		describe('user', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			it('should not set page views if feature not enabled', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key: nanoid(), collected_at: 123n }, pageView],
					[{ key: nanoid(), collected_at: 123n }, pageView]
				];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual('error_feature_not_enabled')
				);
			});

			it('should not set page views if feature not enabled', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key: nanoid(), collected_at: 123n }, trackEvent],
					[{ key: nanoid(), collected_at: 123n }, trackEvent]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual('error_feature_not_enabled')
				);
			});
		});
	});

	describe('configured', () => {
		describe('controller', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should configure satellite', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satellite_id,
							{
								updated_at: [],
								enabled: true
							}
						]
					])
				).resolves.not.toThrowError();
			});

			it('should not configure satellite if no timestamp', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satellite_id,
							{
								updated_at: [],
								enabled: true
							}
						]
					])
				).rejects.toThrow(NO_TIMESTAMP_ERROR_MSG);
			});

			it('should not configure satellite if invalid timestamp', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satellite_id,
							{
								updated_at: [123n],
								enabled: true
							}
						]
					])
				).rejects.toThrowError(new RegExp(INVALID_TIMESTAMP_ERROR_MSG, 'i'));
			});
		});

		describe('user', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			const key = nanoid();

			it('should set page views', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key, collected_at: 123n }, pageView],
					[{ key: nanoid(), collected_at: 123n }, pageView]
				];

				await expect(set_page_views(pagesViews)).resolves.not.toThrowError();
			});

			it('should not set page views if no timestamp', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [[{ key, collected_at: 123n }, pageView]];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual(NO_TIMESTAMP_ERROR_MSG)
				);
			});

			it('should not set page views if if invalid timestamp', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[
						{ key, collected_at: 123n },
						{
							...pageView,
							updated_at: [123n]
						}
					]
				];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toContain(INVALID_TIMESTAMP_ERROR_MSG)
				);
			});

			it('should set track events', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key, collected_at: 123n }, trackEvent],
					[{ key: nanoid(), collected_at: 123n }, trackEvent]
				];

				await expect(set_track_events(trackEvents)).resolves.not.toThrowError();
			});

			it('should not set track events if no timestamp', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key, collected_at: 123n }, trackEvent]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual(NO_TIMESTAMP_ERROR_MSG)
				);
			});

			it('should not set track events if if invalid timestamp', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[
						{ key, collected_at: 123n },
						{
							...trackEvent,
							updated_at: [123n]
						}
					]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toContain(INVALID_TIMESTAMP_ERROR_MSG)
				);
			});
		});
	});
});
