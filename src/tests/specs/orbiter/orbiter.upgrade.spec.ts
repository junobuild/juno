import type {
	_SERVICE as OrbiterActor0_0_6,
	SetPageView as SetPageView0_0_6,
	SetTrackEvent as SetTrackEvent0_0_6
} from '$declarations/deprecated/orbiter-0-0-6.did';
import { idlFactory as idlFactorOrbiter0_0_6 } from '$declarations/deprecated/orbiter-0-0-6.factory.did';
import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	SetPageView,
	SetTrackEvent
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { pageViewMock, satelliteIdMock, trackEventMock } from '../../mocks/orbiter.mocks';
import { tick } from '../../utils/pic-tests.utils';
import {
	ORBITER_WASM_PATH,
	controllersInitArgs,
	downloadOrbiter
} from '../../utils/setup-tests.utils';

describe('Orbiter > Upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor0_0_6>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgrade = async () => {
		await upgradeVersion0_0_8();
		await upgradeCurrent();
	};

	const upgradeCurrent = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: ORBITER_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const upgradeVersion0_0_8 = async () => {
		await tick(pic);

		const destination = await downloadOrbiter('0.0.8');

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	const setPageViews0_0_6 = async (): Promise<AnalyticKey[]> => {
		const { set_page_views } = actor;

		const keys = Array.from({ length: 100 }).map((_, i) => ({
			key: nanoid(),
			collected_at: BigInt(i)
		}));

		const { version: _, ...rest } = pageViewMock;

		const pagesViews: [AnalyticKey, SetPageView0_0_6][] = keys.map((key) => [
			key,
			{
				...rest,
				updated_at: []
			}
		]);

		const results = await set_page_views(pagesViews);

		expect('Err' in results).toBeFalsy();

		return keys;
	};

	const setPageViews = async (useActor: Actor<OrbiterActor>): Promise<AnalyticKey[]> => {
		const { set_page_views } = useActor;

		const keys = Array.from({ length: 100 }).map((_, i) => ({
			key: nanoid(),
			collected_at: BigInt(i)
		}));

		const pagesViews: [AnalyticKey, SetPageView][] = keys.map((key) => [key, pageViewMock]);

		const results = await set_page_views(pagesViews);

		expect('Err' in results).toBeFalsy();

		return keys;
	};

	const testPageViews = async ({
		keys,
		useActor
	}: {
		keys: AnalyticKey[];
		useActor?: Actor<OrbiterActor | OrbiterActor0_0_6>;
	}) => {
		const { get_page_views } = useActor ?? actor;

		const results = await get_page_views({
			to: toNullable(),
			from: toNullable(),
			satellite_id: toNullable()
		});

		expect(results).toHaveLength(keys.length);

		for (const key of keys) {
			const result = results.find(([{ key: k }, _]) => k === key.key);

			expect(result).not.toBeUndefined();

			const [{ collected_at }, pageView] = result!;

			expect(collected_at).toEqual(key.collected_at);

			expect(pageView.title).toEqual(pageViewMock.title);
			expect(pageView.referrer).toEqual(pageViewMock.referrer);
			expect(pageView.time_zone).toEqual(pageViewMock.time_zone);
			expect(pageView.session_id).toEqual(pageViewMock.session_id);
			expect(pageView.href).toEqual(pageViewMock.href);
			expect(pageView.satellite_id.toText()).toEqual(pageViewMock.satellite_id.toText());
			expect(pageView.device.inner_width).toEqual(pageViewMock.device.inner_width);
			expect(pageView.device.inner_height).toEqual(pageViewMock.device.inner_height);
			expect(pageView.user_agent).toEqual(pageViewMock.user_agent);
			expect(pageView.created_at).toBeGreaterThan(0n);
			expect(pageView.updated_at).toBeGreaterThan(0n);
		}
	};

	const setTrackEvents0_0_6 = async (): Promise<AnalyticKey[]> => {
		const { set_track_events } = actor;

		const keys = Array.from({ length: 100 }).map((_, i) => ({
			key: nanoid(),
			collected_at: BigInt(i)
		}));

		const { version: _, ...rest } = trackEventMock;

		const trackEvents: [AnalyticKey, SetTrackEvent0_0_6][] = keys.map((key) => [
			key,
			{
				...rest,
				updated_at: []
			}
		]);

		const results = await set_track_events(trackEvents);

		expect('Err' in results).toBeFalsy();

		return keys;
	};

	const setTrackEvents = async (useActor: Actor<OrbiterActor>): Promise<AnalyticKey[]> => {
		const { set_track_events } = useActor;

		const keys = Array.from({ length: 100 }).map((_, i) => ({
			key: nanoid(),
			collected_at: BigInt(i)
		}));

		const trackEvents: [AnalyticKey, SetTrackEvent][] = keys.map((key) => [key, trackEventMock]);

		const results = await set_track_events(trackEvents);

		expect('Err' in results).toBeFalsy();

		return keys;
	};

	const testTrackEvents = async ({
		keys,
		useActor
	}: {
		keys: AnalyticKey[];
		useActor?: Actor<OrbiterActor | OrbiterActor0_0_6>;
	}) => {
		const { get_track_events } = useActor ?? actor;

		const results = await get_track_events({
			to: toNullable(),
			from: toNullable(),
			satellite_id: toNullable()
		});

		expect(results).toHaveLength(keys.length);

		for (const key of keys) {
			const result = results.find(([{ key: k }, _]) => k === key.key);

			expect(result).not.toBeUndefined();

			const [{ collected_at }, trackEvent] = result!;

			expect(collected_at).toEqual(key.collected_at);

			expect(trackEvent.name).toEqual(trackEventMock.name);
			expect(fromNullable(trackEvent.metadata)!.sort()).toEqual(
				fromNullable(trackEventMock.metadata)!.sort()
			);
			expect(trackEvent.session_id).toEqual(trackEventMock.session_id);
			expect(trackEvent.satellite_id.toText()).toEqual(trackEventMock.satellite_id.toText());
			expect(trackEvent.created_at).toBeGreaterThan(0n);
			expect(trackEvent.updated_at).toBeGreaterThan(0n);
		}
	};

	describe('v0.0.6 -> v0.0.7', () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadOrbiter('0.0.6');

			const { actor: c, canisterId: cId } = await pic.setupCanister<OrbiterActor0_0_6>({
				idlFactory: idlFactorOrbiter0_0_6,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);

			const { set_satellite_configs } = actor;

			await expect(
				set_satellite_configs([
					[
						satelliteIdMock,
						{
							updated_at: [],
							enabled: true
						}
					]
				])
			).resolves.not.toThrowError();
		});

		describe('Page views', { timeout: 1200000 }, () => {
			it('should still list all entries after upgrade', async () => {
				const originalKeys = await setPageViews0_0_6();

				await testPageViews({ keys: originalKeys });

				await upgrade();

				const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
				newActor.setIdentity(controller);

				await testPageViews({ keys: originalKeys, useActor: newActor });
			});

			it('should be able to collect new entry and list both bounded and unbounded serialized data', async () => {
				const keysBeforeUpgrade = await setPageViews0_0_6();

				await testPageViews({ keys: keysBeforeUpgrade });

				await upgrade();

				const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
				newActor.setIdentity(controller);

				const keysAfterUpgrade = await setPageViews(newActor);

				await testPageViews({
					keys: [...keysBeforeUpgrade, ...keysAfterUpgrade],
					useActor: newActor
				});
			});

			it('should be able to update existing entry after upgrade and remain bounded', async () => {
				const keysBeforeUpgrade = await setPageViews0_0_6();

				await upgrade();

				const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
				newActor.setIdentity(controller);

				const { set_page_views, get_page_views } = newActor;

				const [[__, { updated_at }]] = await get_page_views({
					to: toNullable(),
					from: toNullable(),
					satellite_id: toNullable()
				});

				const [key, _] = keysBeforeUpgrade;

				const results = await set_page_views([
					[
						key,
						{
							...pageViewMock,
							updated_at: toNullable(updated_at),
							version: []
						}
					]
				]);

				expect('Err' in results).toBeFalsy();
			});
		});

		describe('Track events', { timeout: 1200000 }, () => {
			it('should still list all entries after upgrade', async () => {
				const keys = await setTrackEvents0_0_6();

				await testTrackEvents({ keys });

				await upgrade();

				const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
				newActor.setIdentity(controller);

				await testTrackEvents({
					keys: keys,
					useActor: newActor
				});
			});

			it('should be able to collect new entry and list both bounded and unbounded serialized data', async () => {
				const keysBeforeUpgrade = await setTrackEvents0_0_6();

				await testTrackEvents({ keys: keysBeforeUpgrade });

				await upgrade();

				const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
				newActor.setIdentity(controller);

				const keysAfterUpgrade = await setTrackEvents(newActor);

				await testTrackEvents({
					keys: [...keysBeforeUpgrade, ...keysAfterUpgrade],
					useActor: newActor
				});
			});

			it('should be able to update existing entry after upgrade and remain bounded', async () => {
				const keysBeforeUpgrade = await setTrackEvents0_0_6();

				await upgrade();

				const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
				newActor.setIdentity(controller);

				const { set_track_events, get_track_events } = newActor;

				const [[__, { updated_at }]] = await get_track_events({
					to: toNullable(),
					from: toNullable(),
					satellite_id: toNullable()
				});

				const [key, _] = keysBeforeUpgrade;

				const results = await set_track_events([
					[
						key,
						{
							...trackEventMock,
							updated_at: toNullable(updated_at),
							version: toNullable()
						}
					]
				]);

				expect('Err' in results).toBeFalsy();
			});
		});
	});
});
