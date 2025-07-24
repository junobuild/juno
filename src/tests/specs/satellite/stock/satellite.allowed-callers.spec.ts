import type {
	AuthenticationConfig,
	_SERVICE as SatelliteActor
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { beforeAll, describe, expect, inject } from 'vitest';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Allowed Callers', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const createUser = async (user: Identity) => {
		actor.setIdentity(user);

		const { set_doc } = actor;

		return await set_doc('#user', user.getPrincipal().toText(), {
			data: await toArray({
				provider: 'internet_identity'
			}),
			description: toNullable(),
			version: toNullable()
		});
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setSomeAllowedCaller = async () => {
		const someCaller = Ed25519KeyIdentity.generate();
		await setAllowedCallers({ allowedCallers: [someCaller.getPrincipal()] });
	};

	const setAllowedCallers = async ({ allowedCallers }: { allowedCallers: Principal[] }) => {
		actor.setIdentity(controller);

		const { set_auth_config } = actor;

		const config: AuthenticationConfig = {
			internet_identity: [],
			rules: [
				{
					allowed_callers: allowedCallers
				}
			]
		};

		await set_auth_config(config);
	};

	const setEmptyAllowedCallers = async () => {
		actor.setIdentity(controller);

		const { set_auth_config } = actor;

		const config: AuthenticationConfig = {
			internet_identity: [],
			rules: [
				{
					allowed_callers: []
				}
			]
		};

		await set_auth_config(config);
	};

	const resetAuthConfig = async () => {
		actor.setIdentity(controller);

		const { set_auth_config } = actor;

		const config: AuthenticationConfig = {
			internet_identity: [],
			rules: []
		};

		await set_auth_config(config);
	};

	describe("Without auth config", () => {
		const collection = 'test_allowed_callers_without_config';

		describe('Datastore', () => {
			let user: Identity;

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { set_rule } = actor;

				await set_rule({ Db: null }, collection, mockSetRule);
			});

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
			});

			describe('get document', () => {
				let docKey: string;

				beforeEach(async () => {
					await createUser(user);

					const { set_doc } = actor;

					docKey = nanoid();

					await set_doc(collection, docKey, {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				});

				const assertAllowed = async ({actorIdentity}: {actorIdentity?: Identity} = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				}

				it('should get document if no config', async () => {
					await assertAllowed();
				});
			});
		});
	})

	describe("With auth config", () => {
		const collection = 'test_allowed_callers';

		describe('Datastore', () => {
			let user: Identity;

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { set_rule } = actor;

				await set_rule({ Db: null }, collection, mockSetRule);
			});

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
			});

			describe('get document', () => {
				let docKey: string;

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);

					const { set_doc } = actor;

					docKey = nanoid();

					await set_doc(collection, docKey, {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				});

				it('should not get document if not allowed', async () => {
					await setSomeAllowedCaller();

					actor.setIdentity(user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).toBeUndefined();
				});

				const assertAllowed = async ({actorIdentity}: {actorIdentity?: Identity} = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				}

				it('should get document if no rules', async () => {
					await assertAllowed();
				});

				it('should get document if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should get document if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({actorIdentity: controller});
				});
			});
		});
	})
});
