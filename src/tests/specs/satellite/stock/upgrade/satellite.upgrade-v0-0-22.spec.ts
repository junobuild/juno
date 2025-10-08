import {
	idlFactorySatellite,
	idlFactorySatellite0021,
	type SatelliteActor,
	type SatelliteActor0021
} from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { upgradeSatelliteVersion } from '../../../../utils/satellite-upgrade-tests.utils';
import { controllersInitArgs, downloadSatellite } from '../../../../utils/setup-tests.utils';

describe('Satellite > Upgrade > v0.0.22', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	let actor: Actor<SatelliteActor0021>;

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadSatellite('0.0.21');

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor0021>({
			idlFactory: idlFactorySatellite0021,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should still migrate rules with none max_changes_per_users', async () => {
		const { set_rule } = actor;

		const collection = 'test_migration';

		await set_rule({ Db: null }, collection, {
			memory: toNullable({ Heap: null }),
			version: toNullable(),
			max_size: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(),
			write: { Public: null },
			max_capacity: toNullable(),
			rate_config: toNullable()
		});

		await upgradeSatelliteVersion({ version: '0.0.22', controller, pic, canisterId });

		const newActor = pic.createActor<SatelliteActor>(idlFactorySatellite, canisterId);
		newActor.setIdentity(controller);

		const { get_rule } = newActor;

		const result = await get_rule({ Db: null }, collection);

		const rule = fromNullable(result);

		assertNonNullish(rule);

		const {
			updated_at,
			created_at,
			memory,
			mutable_permissions,
			read,
			write,
			version,
			max_changes_per_user
		} = rule;

		expect(memory).toEqual(toNullable({ Heap: null }));
		expect(read).toEqual({ Managed: null });
		expect(write).toEqual({ Public: null });
		expect(mutable_permissions).toEqual([true]);
		expect(created_at).toBeGreaterThan(0n);
		expect(updated_at).toBeGreaterThan(0n);
		expect(fromNullable(version)).toEqual(1n);

		expect(fromNullable(max_changes_per_user)).toBeUndefined();
	});

	it('should create a rule for collection #user-usage', async () => {
		const collection = '#user-usage';

		const { get_rule: getRuleBefore } = actor;

		const beforeUpgrade = await getRuleBefore({ Db: null }, collection);

		expect(fromNullable(beforeUpgrade)).toBeUndefined();

		await upgradeSatelliteVersion({ version: '0.0.22', controller, pic, canisterId });

		const newActor = pic.createActor<SatelliteActor>(idlFactorySatellite, canisterId);
		newActor.setIdentity(controller);

		const { get_rule: getRuleAfter } = newActor;

		const afterUpgrade = await getRuleAfter({ Db: null }, collection);

		const rule = fromNullable(afterUpgrade);

		assertNonNullish(rule);

		const {
			updated_at,
			created_at,
			memory,
			mutable_permissions,
			read,
			write,
			version,
			max_changes_per_user,
			max_capacity,
			max_size,
			rate_config
		} = rule;

		expect(memory).toEqual(toNullable({ Stable: null }));
		expect(read).toEqual({ Controllers: null });
		expect(write).toEqual({ Controllers: null });
		expect(mutable_permissions).toEqual([false]);
		expect(created_at).toBeGreaterThan(0n);
		expect(updated_at).toBeGreaterThan(0n);
		expect(fromNullable(version)).toBeUndefined();
		expect(fromNullable(max_changes_per_user)).toBeUndefined();
		expect(fromNullable(max_capacity)).toBeUndefined();
		expect(fromNullable(max_size)).toBeUndefined();
		expect(fromNullable(rate_config)).toBeUndefined();
	});
});
