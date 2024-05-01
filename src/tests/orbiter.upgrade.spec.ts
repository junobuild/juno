import type {
	AnalyticKey,
	_SERVICE as OrbiterActor,
	_SERVICE as OrbiterActor0_0_6,
	SetPageView
} from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { pageViewMock } from './mocks/orbiter.mocks';
import { tick } from './utils/pic-tests.utils';
import { ORBITER_WASM_PATH, controllersInitArgs, downloadOrbiter } from './utils/setup-tests.utils';

describe('Orbiter upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor0_0_6>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgradeVersion = async (version: string) => {
		await tick(pic);

		const destination = await downloadOrbiter(version);

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: ORBITER_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const setPageViews = async (
		useActor?: Actor<OrbiterActor | OrbiterActor0_0_6>
	): Promise<AnalyticKey[]> => {
		const { set_page_views } = useActor ?? actor;

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
		keys: { key: AnalyticKey; memoryAllocation?: 'bounded' | 'unbounded' }[];
		useActor?: Actor<OrbiterActor | OrbiterActor0_0_6>;
	}) => {
		const { get_page_views } = useActor ?? actor;

		const results = await get_page_views({
			to: toNullable(),
			from: toNullable(),
			satellite_id: toNullable()
		});

		expect(results).toHaveLength(keys.length);

		for (const { key, memoryAllocation } of keys) {
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

			switch (memoryAllocation) {
				case 'bounded':
					expect(pageView.memory_allocation).toEqual(toNullable({ Bounded: null }));
					break;
				case 'unbounded':
					expect(pageView.memory_allocation).toEqual(toNullable({ Unbounded: null }));
					break;
				default:
					expect(pageView.memory_allocation).toEqual(toNullable());
			}
		}
	};

	const satellite_id = Principal.fromText('ck4tp-3iaaa-aaaal-ab7da-cai');

	describe('v0.0.6 -> v0.0.7', async () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadOrbiter('0.0.6');

			const { actor: c, canisterId: cId } = await pic.setupCanister<OrbiterActor0_0_6>({
				idlFactory: idlFactorOrbiter,
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
						satellite_id,
						{
							updated_at: [],
							enabled: true
						}
					]
				])
			).resolves.not.toThrowError();
		});

		it('should still list all page views after upgrade', async () => {
			const keys = await setPageViews();

			await testPageViews({ keys: keys.map((key) => ({ key })) });

			await upgrade();

			const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
			newActor.setIdentity(controller);

			await testPageViews({
				keys: keys.map((key) => ({ key, memoryAllocation: 'bounded' })),
				useActor: newActor
			});
		});

		it('should be able to collect new page views and list both bounded and unbounded serialized data', async () => {
			const keysBeforeUpgrade = await setPageViews();

			await testPageViews({ keys: keysBeforeUpgrade.map((key) => ({ key })) });

			await upgrade();

			const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
			newActor.setIdentity(controller);

			const keysAfterUpgrade = await setPageViews(newActor);

			await testPageViews({
				keys: [
					...keysBeforeUpgrade.map((key) => ({ key, memoryAllocation: 'bounded' as const })),
					...keysAfterUpgrade.map((key) => ({ key, memoryAllocation: 'unbounded' as const }))
				],
				useActor: newActor
			});
		});

		it('should be able to update existing page views after upgrade and remain bounded', async () => {
			const keysBeforeUpgrade = await setPageViews();

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
						updated_at: toNullable(updated_at)
					}
				]
			]);

			expect('Err' in results).toBeFalsy();

			const [[___, { memory_allocation }]] = await get_page_views({
				to: toNullable(),
				from: toNullable(),
				satellite_id: toNullable()
			});

			expect(memory_allocation).toEqual(toNullable({ Bounded: null }));
		});
	});
});
