import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity, type Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	JUNO_DATASTORE_ERROR_CANNOT_WRITE,
	JUNO_DATASTORE_ERROR_USER_CALLER_KEY,
	JUNO_DATASTORE_ERROR_USER_CANNOT_UPDATE,
	JUNO_DATASTORE_ERROR_USER_INVALID_DATA,
	JUNO_DATASTORE_ERROR_USER_KEY_NO_PRINCIPAL,
	JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED
} from './constants/satellite-tests.constants';
import { SATELLITE_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Satellite > User', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('user', () => {
		describe('success', () => {
			let user: Identity;

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
				actor.setIdentity(user);
			});

			it('should create a user', async () => {
				const { set_doc, list_docs } = actor;

				await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				const { items: users } = await list_docs('#user', {
					matcher: toNullable(),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				});

				expect(users).toHaveLength(1);
				expect(users.find(([key]) => key === user.getPrincipal().toText())).not.toBeUndefined();
			});

			it('should create a user without provider because this is optional', async () => {
				const { set_doc } = actor;

				const doc = await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: undefined
					}),
					description: toNullable(),
					version: toNullable()
				});

				expect(doc).not.toBeUndefined();
			});

			it('should create a user without data because those is optional', async () => {
				const { set_doc } = actor;

				const doc = await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({}),
					description: toNullable(),
					version: toNullable()
				});

				expect(doc).not.toBeUndefined();
			});

			it('should delete a user', async () => {
				actor.setIdentity(user);

				const { set_doc, get_doc } = actor;

				await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				const before = await get_doc('#user', user.getPrincipal().toText());

				const { del_doc } = actor;

				await expect(
					del_doc('#user', user.getPrincipal().toText(), {
						version: fromNullable(before)?.version ?? []
					})
				).resolves.not.toThrowError();
			});
		});

		describe('error', () => {
			let user: Identity;

			beforeEach(() => {
				user = Ed25519KeyIdentity.generate();
				actor.setIdentity(user);
			});

			it('should not update a user because only controller can update', async () => {
				const { set_doc, get_doc } = actor;

				await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				const before = await get_doc('#user', user.getPrincipal().toText());

				await expect(
					set_doc('#user', user.getPrincipal().toText(), {
						data: await toArray({
							provider: 'nfid'
						}),
						description: toNullable(),
						version: fromNullable(before)?.version ?? []
					})
				).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_CANNOT_UPDATE);
			});

			it('should not delete a user if banned', async () => {
				const { set_doc, get_doc } = actor;

				const before = await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({}),
					description: toNullable(),
					version: toNullable()
				});

				actor.setIdentity(controller);

				const { set_doc: setDocBan } = actor;

				const bannedUser = await setDocBan('#user', user.getPrincipal().toText(), {
					data: await toArray({
						banned: 'indefinite'
					}),
					description: toNullable(),
					version: before.version
				});

				actor.setIdentity(user);

				await expect(
					set_doc('#user', user.getPrincipal().toText(), {
						data: await toArray({
							provider: 'nfid'
						}),
						description: toNullable(),
						version: bannedUser.version ?? []
					})
				).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED);
			});
		});
	});

	describe('anonymous', () => {
		const anonymous = new AnonymousIdentity();

		beforeAll(() => {
			actor.setIdentity(anonymous);
		});

		it('should not create an anonymous user', async () => {
			const { set_doc } = actor;

			await expect(
				set_doc('#user', anonymous.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				})
			).rejects.toThrow(JUNO_DATASTORE_ERROR_CANNOT_WRITE);
		});

		it('should not create another user', async () => {
			const { set_doc } = actor;

			const user = Ed25519KeyIdentity.generate();

			await expect(
				set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				})
			).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_CALLER_KEY);
		});

		it('should not delete a user', async () => {
			const user = Ed25519KeyIdentity.generate();

			actor.setIdentity(user);

			const { set_doc, get_doc } = actor;

			await set_doc('#user', user.getPrincipal().toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				version: toNullable()
			});

			const before = await get_doc('#user', user.getPrincipal().toText());

			actor.setIdentity(anonymous);

			const { del_doc } = actor;

			await expect(
				del_doc('#user', user.getPrincipal().toText(), {
					version: fromNullable(before)?.version ?? []
				})
			).rejects.toThrow(JUNO_DATASTORE_ERROR_CANNOT_WRITE);
		});
	});

	describe('Controller Read+Write', () => {
		const controllerReadWrite = Ed25519KeyIdentity.generate();

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Write: null },
					metadata: [],
					expires_at: []
				},
				controllers: [controllerReadWrite.getPrincipal()]
			});
		});

		describe('success', () => {
			it('should not update a user', async () => {
				const user = Ed25519KeyIdentity.generate();

				actor.setIdentity(user);

				const { set_doc, get_doc } = actor;

				await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				const before = await get_doc('#user', user.getPrincipal().toText());

				actor.setIdentity(controllerReadWrite);

				const { set_doc: set_doc_after } = actor;

				await expect(
					set_doc_after('#user', user.getPrincipal().toText(), {
						data: await toArray({
							provider: 'nfid'
						}),
						description: toNullable(),
						version: fromNullable(before)?.version ?? []
					})
				).resolves.not.toThrowError();
			});
		});

		describe('error', () => {
			it('should not delete a user', async () => {
				const user = Ed25519KeyIdentity.generate();

				actor.setIdentity(user);

				const { set_doc, get_doc } = actor;

				await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				const before = await get_doc('#user', user.getPrincipal().toText());

				actor.setIdentity(controllerReadWrite);

				const { del_doc } = actor;

				await expect(
					del_doc('#user', user.getPrincipal().toText(), {
						version: fromNullable(before)?.version ?? []
					})
				).resolves.not.toThrowError();
			});
		});
	});

	describe('Admin', () => {
		describe('success', () => {
			it('should update a user', async () => {
				const user = Ed25519KeyIdentity.generate();

				actor.setIdentity(user);

				const { set_doc, get_doc } = actor;

				await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				const before = await get_doc('#user', user.getPrincipal().toText());

				actor.setIdentity(controller);

				const { set_doc: set_doc_after, get_doc: get_doc_after } = actor;

				await set_doc_after('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'nfid'
					}),
					description: toNullable(),
					version: fromNullable(before)?.version ?? []
				});

				const after = await get_doc_after('#user', user.getPrincipal().toText());

				const doc = fromNullable(after);

				expect(doc).not.toBeUndefined();
				expect(doc?.updated_at ?? 0n).toBeGreaterThan(doc?.created_at ?? 0n);
			});

			it('should delete a user', async () => {
				const user = Ed25519KeyIdentity.generate();

				actor.setIdentity(user);

				const { set_doc } = actor;

				const before = await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				actor.setIdentity(controller);

				const { del_doc } = actor;

				await expect(
					del_doc('#user', user.getPrincipal().toText(), {
						version: before.version
					})
				).resolves.not.toThrowError();
			});

			it('should delete a banned user', async () => {
				const user = Ed25519KeyIdentity.generate();

				actor.setIdentity(user);

				const { set_doc } = actor;

				const before = await set_doc('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity'
					}),
					description: toNullable(),
					version: toNullable()
				});

				actor.setIdentity(controller);

				const { del_doc, set_doc: set_doc_after } = actor;

				const afterBan = await set_doc_after('#user', user.getPrincipal().toText(), {
					data: await toArray({
						provider: 'internet_identity',
						banned: 'indefinite'
					}),
					description: toNullable(),
					version: before.version
				});

				await expect(
					del_doc('#user', user.getPrincipal().toText(), {
						version: afterBan.version
					})
				).resolves.not.toThrowError();
			});
		});

		describe('error', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			describe('key', () => {
				const user = Ed25519KeyIdentity.generate();

				it('should not create a user if caller is not the user', async () => {
					const { set_doc } = actor;

					await expect(
						set_doc('#user', user.getPrincipal().toText(), {
							data: await toArray({
								provider: 'internet_identity'
							}),
							description: toNullable(),
							version: toNullable()
						})
					).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_CALLER_KEY);
				});

				it('should not create a user if key is not a principal', async () => {
					const { set_doc } = actor;

					await expect(
						set_doc('#user', 'test', {
							data: await toArray({
								provider: 'internet_identity'
							}),
							description: toNullable(),
							version: toNullable()
						})
					).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_KEY_NO_PRINCIPAL);
				});
			});
		});
	});

	describe('Data', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should not create a user with an unknown provider', async () => {
			const { set_doc } = actor;

			const data = await toArray({
				provider: 'unknown'
			});

			await expect(
				set_doc('#user', user.getPrincipal().toText(), {
					data,
					description: toNullable(),
					version: toNullable()
				})
			).rejects.toThrow(
				`${JUNO_DATASTORE_ERROR_USER_INVALID_DATA}: unknown variant \`unknown\`, expected \`internet_identity\` or \`nfid\` at line 1 column 21.`
			);
		});

		it('should not create a user with invalid additional data fields', async () => {
			const { set_doc } = actor;

			const data = await toArray({
				provider: 'internet_identity',
				unknown: 'field'
			});

			await expect(
				set_doc('#user', user.getPrincipal().toText(), {
					data,
					description: toNullable(),
					version: toNullable()
				})
			).rejects.toThrow(
				`${JUNO_DATASTORE_ERROR_USER_INVALID_DATA}: unknown field \`unknown\`, expected \`provider\` or \`banned\` at line 1 column 41.`
			);
		});
	});
});
