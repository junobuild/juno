import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	SetPageView,
	SetTrackEvent
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	INVALID_VERSION_ERROR_MSG,
	NO_VERSION_ERROR_MSG
} from './constants/satellite-tests.constants';
import { pageViewMock, satelliteIdMock, trackEventMock } from './mocks/orbiter.mocks';
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

	describe('not configured', () => {
		describe('user', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			it('should not set page views if feature not enabled', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key: nanoid(), collected_at: 123n }, pageViewMock],
					[{ key: nanoid(), collected_at: 123n }, pageViewMock]
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
					[{ key: nanoid(), collected_at: 123n }, trackEventMock],
					[{ key: nanoid(), collected_at: 123n }, trackEventMock]
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
							satelliteIdMock,
							{
								version: [],
								enabled: true
							}
						]
					])
				).resolves.not.toThrowError();
			});

			it('should not configure satellite if no version', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satelliteIdMock,
							{
								version: [],
								enabled: true
							}
						]
					])
				).rejects.toThrow(NO_VERSION_ERROR_MSG);
			});

			it('should not configure satellite if invalid version', async () => {
				const { set_satellite_configs } = actor;

				await expect(
					set_satellite_configs([
						[
							satelliteIdMock,
							{
								version: [123n],
								enabled: true
							}
						]
					])
				).rejects.toThrowError(new RegExp(INVALID_VERSION_ERROR_MSG, 'i'));
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
					[{ key, collected_at: 123n }, pageViewMock],
					[{ key: nanoid(), collected_at: 123n }, pageViewMock]
				];

				await expect(set_page_views(pagesViews)).resolves.not.toThrowError();
			});

			it('should not set page views if no version', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[{ key, collected_at: 123n }, pageViewMock]
				];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual(NO_VERSION_ERROR_MSG)
				);
			});

			it('should not set page views if invalid version', async () => {
				const { set_page_views } = actor;

				const pagesViews: [AnalyticKey, SetPageView][] = [
					[
						{ key, collected_at: 123n },
						{
							...pageViewMock,
							version: [123n]
						}
					]
				];

				const results = await set_page_views(pagesViews);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toContain(INVALID_VERSION_ERROR_MSG)
				);
			});

			it('should set track events', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key, collected_at: 123n }, trackEventMock],
					[{ key: nanoid(), collected_at: 123n }, trackEventMock]
				];

				await expect(set_track_events(trackEvents)).resolves.not.toThrowError();
			});

			it('should not set track events if no version', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[{ key, collected_at: 123n }, trackEventMock]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toEqual(NO_VERSION_ERROR_MSG)
				);
			});

			it('should not set track events if invalid version', async () => {
				const { set_track_events } = actor;

				const trackEvents: [AnalyticKey, SetTrackEvent][] = [
					[
						{ key, collected_at: 123n },
						{
							...trackEventMock,
							version: [123n]
						}
					]
				];

				const results = await set_track_events(trackEvents);

				expect('Err' in results).toBeTruthy();

				(results as { Err: Array<[AnalyticKey, string]> }).Err.forEach(([_, msg]) =>
					expect(msg).toContain(INVALID_VERSION_ERROR_MSG)
				);
			});
		});
	});
});
