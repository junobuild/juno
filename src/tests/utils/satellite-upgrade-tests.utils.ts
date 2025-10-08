import type { SatelliteActor0016, SatelliteActor0017, SatelliteActor0021 } from '$declarations';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
import { tick } from './pic-tests.utils';
import { downloadSatellite, SATELLITE_WASM_PATH } from './setup-tests.utils';

export const upgradeSatelliteVersion = async ({
	version,
	pic,
	canisterId,
	controller
}: {
	version: string;
	pic: PocketIc;
	controller: Identity;
	canisterId: Principal;
}) => {
	await tick(pic);

	const destination = await downloadSatellite(version);

	await pic.upgradeCanister({
		canisterId,
		wasm: destination,
		sender: controller.getPrincipal()
	});
};

export const upgradeSatellite = async ({
	pic,
	canisterId,
	controller
}: {
	pic: PocketIc;
	controller: Identity;
	canisterId: Principal;
}) => {
	await tick(pic);

	await pic.upgradeCanister({
		canisterId,
		wasm: SATELLITE_WASM_PATH,
		sender: controller.getPrincipal()
	});
};

export const initUsers = async (actor: Actor<SatelliteActor0016>): Promise<Identity[]> => {
	const { set_doc } = actor;

	const user1 = Ed25519KeyIdentity.generate();

	await set_doc('#user', user1.getPrincipal().toText(), {
		data: await toArray({
			provider: 'internet_identity'
		}),
		description: toNullable(),
		updated_at: toNullable()
	});

	const user2 = Ed25519KeyIdentity.generate();

	await set_doc('#user', user2.getPrincipal().toText(), {
		data: await toArray({
			provider: 'internet_identity'
		}),
		description: toNullable(),
		updated_at: toNullable()
	});

	return [user1, user2];
};

export const testUsers = async ({
	users,
	actor
}: {
	users: Identity[];
	actor: Actor<SatelliteActor0016 | SatelliteActor0017 | SatelliteActor0021>;
}) => {
	const { list_docs } = actor;

	const { items } = await list_docs('#user', {
		matcher: toNullable(),
		order: toNullable(),
		owner: toNullable(),
		paginate: toNullable()
	});

	expect(users).toHaveLength(users.length);

	for (const user of users) {
		expect(items.find(([key]) => key === user.getPrincipal().toText())).not.toBeUndefined();
	}
};
