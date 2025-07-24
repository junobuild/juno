import type {
	AuthenticationConfig,
	Doc,
	_SERVICE as SatelliteActor,
	SetDoc
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import { JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED } from '@junobuild/errors';
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

	describe('Without auth config', () => {
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

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				};

				it('should get document if no config', async () => {
					await assertAllowed();
				});
			});

			describe('get many documents', () => {
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

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);

					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				};

				it('should get documents if no config', async () => {
					await assertAllowed();
				});
			});

			describe('set document', () => {
				const createDoc = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<Doc> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_doc } = actor;

					return await set_doc(collection, nanoid(), {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					const doc = await createDoc(params);

					expect(doc).not.toBeUndefined();
				};

				it('should set document if no config', async () => {
					await assertAllowed();
				});
			});

			describe('set many documents', () => {
				const createDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_many_docs } = actor;

					const data: SetDoc = {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					};

					await set_many_docs([
						[collection, nanoid(), data],
						[collection, nanoid(), data]
					]);
				};

				beforeEach(async () => {
					await createUser(user);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(createDocs(params)).resolves.not.toThrow();
				};

				it('should set many documents if no config', async () => {
					await assertAllowed();
				});
			});
		});
	});

	describe('With auth config', () => {
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

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);
					const { get_doc } = actor;

					const result = await get_doc(collection, docKey);
					const doc = fromNullable(result);

					expect(doc).not.toBeUndefined();
				};

				it('should get document if no rules', async () => {
					await assertAllowed();
				});

				it('should get document if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should get document if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('get many documents', () => {
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

				it('should not get documents if not allowed', async () => {
					await setSomeAllowedCaller();

					actor.setIdentity(user);
					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).toBeUndefined();
				});

				const assertAllowed = async ({ actorIdentity }: { actorIdentity?: Identity } = {}) => {
					actor.setIdentity(actorIdentity ?? user);

					const { get_many_docs } = actor;

					const result = await get_many_docs([[collection, docKey]]);

					const doc = fromNullable(result[0][1]);

					expect(doc).not.toBeUndefined();
				};

				it('should get documents if no rules', async () => {
					await assertAllowed();
				});

				it('should get documents if empty allowed callers', async () => {
					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should get documents if controller', async () => {
					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('set document', () => {
				const createDoc = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<Doc> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_doc } = actor;

					return await set_doc(collection, nanoid(), {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					});
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not set document if not allowed', async () => {
					const doc = await createDoc();

					expect(doc).not.toBeUndefined();

					await setSomeAllowedCaller();

					await expect(createDoc()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					const doc = await createDoc(params);

					expect(doc).not.toBeUndefined();
				};

				it('should set document if no rules', async () => {
					await assertAllowed();
				});

				it('should set document if empty allowed callers', async () => {
					await createDoc();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should set document if controller', async () => {
					await createDoc({ actorIdentity: controller });

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});

			describe('set many documents', () => {
				const createDocs = async ({
					actorIdentity
				}: { actorIdentity?: Identity } = {}): Promise<void> => {
					actor.setIdentity(actorIdentity ?? user);

					const { set_many_docs } = actor;

					const data: SetDoc = {
						data: await toArray({
							hello: 'world'
						}),
						description: toNullable(),
						version: toNullable()
					};

					await set_many_docs([
						[collection, nanoid(), data],
						[collection, nanoid(), data]
					]);
				};

				beforeEach(async () => {
					await resetAuthConfig();

					await createUser(user);
				});

				it('should not set many documents if not allowed', async () => {
					await expect(createDocs()).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await expect(createDocs()).rejects.toThrow(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED);
				});

				const assertAllowed = async (params: { actorIdentity?: Identity } = {}) => {
					await expect(createDocs(params)).resolves.not.toThrow();
				};

				it('should set many documents if no rules', async () => {
					await assertAllowed();
				});

				it('should set many documents if empty allowed callers', async () => {
					await expect(createDocs()).resolves.not.toThrow();

					await setEmptyAllowedCallers();

					await assertAllowed();
				});

				it('should set many documents if controller', async () => {
					await expect(createDocs({ actorIdentity: controller })).resolves.not.toThrow();

					await setSomeAllowedCaller();

					await assertAllowed({ actorIdentity: controller });
				});
			});
		});
	});
});
