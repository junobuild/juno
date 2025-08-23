import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { upgradeSatellite } from '../../../../utils/satellite-upgrade-tests.utils';
import { controllersInitArgs, downloadSatellite } from '../../../../utils/setup-tests.utils';

describe('Satellite > Upgrade > v0.1.3', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	let actor: Actor<SatelliteActor>;

	const PREVIOUS_VERSION = '0.1.2';

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadSatellite(PREVIOUS_VERSION);

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
	});

	it('should create a rule for collection #user-webauthn', async () => {
		const collection = '#user-webauthn';

		const { get_rule: getRuleBefore } = actor;

		const beforeUpgrade = await getRuleBefore({ Db: null }, collection);

		expect(fromNullable(beforeUpgrade)).toBeUndefined();

		await upgradeSatellite({ pic, canisterId, controller });

		const newActor = pic.createActor<SatelliteActor>(idlFactorSatellite, canisterId);
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
		expect(read).toEqual({ Public: null });
		expect(write).toEqual({ Managed: null });
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
