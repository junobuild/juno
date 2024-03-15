import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { afterEach, beforeEach, describe, expect } from 'vitest';
import {
	WASM_PATH,
	WASM_PATH_V0_0_15,
	downloadSatelliteV0_0_15,
	satelliteInitArgs
} from './utils/satellite-tests.utils';

describe('Satellite upgrade v0.0.16', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create();

		await downloadSatelliteV0_0_15();

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: WASM_PATH_V0_0_15,
			arg: satelliteInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgrade = async () => {
		// Prevent Error: Canister lxzze-o7777-77777-aaaaa-cai is rate limited because it executed too many instructions in the previous install_code messages. Please retry installation after several minutes.
		for (let i = 0; i < 100; i++) {
			await pic.tick();
		}

		await pic.upgradeCanister({
			canisterId,
			wasm: WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const initUsers = async (): Promise<Identity[]> => {
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

	const testUsers = async (users: Identity[]) => {
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

	it('should still list users from heap', async () => {
		await initUsers();

		const users = await initUsers();

		await testUsers(users);

		await upgrade();

		await testUsers(users);
	});

	it('should add users after upgrade and still list all users from heap', async () => {
		await initUsers();

		const users = await initUsers();

		await testUsers(users);

		await upgrade();

		const moreUsers = await initUsers();

		await testUsers([...users, ...moreUsers]);
	});

	it('should keep listing existing heap collections as such', async () => {
		const { set_rule, list_rules } = actor;

		await set_rule({ Db: null }, 'test', {
			memory: toNullable({ Heap: null }),
			updated_at: toNullable(),
			max_size: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(),
			write: { Managed: null }
		});

		const testCollection = async () => {
			const [[collection, { memory }], _] = await list_rules({
				Db: null
			});

			expect(collection).toEqual('test');
			expect(memory).toEqual(toNullable({ Heap: null }));
		};

		await testCollection();

		await upgrade();

		await testCollection();
	});
});
