import type { _SERVICE as SatelliteActor, SetDoc } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity, type Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { beforeAll, describe, expect, inject } from 'vitest';
import { USER_CANNOT_WRITE } from './constants/satellite-tests.constants';
import { mockSetRule } from './mocks/collection.mocks';
import { controllersInitArgs, SATELLITE_WASM_PATH } from './utils/setup-tests.utils';

describe('Satellite User Usage', () => {
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

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Guard', () => {
		describe.each([{ user: Ed25519KeyIdentity.generate() }, { user: new AnonymousIdentity() }])(
			'%s',
			({ user }) => {
				beforeEach(() => {
					actor.setIdentity(user);
				});

				it('should not set user admin', async () => {
					const { set_doc } = actor;

					const key = `${user.getPrincipal().toText()}`;

					const doc: SetDoc = {
						data: await toArray({
							banned: undefined
						}),
						description: toNullable(),
						version: toNullable()
					};

					await expect(set_doc('#user-admin', key, doc)).rejects.toThrow(USER_CANNOT_WRITE);
				});
			}
		);

		describe('Admin', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should not set admin with invalid type', async () => {
				const { set_doc } = actor;

				const key = `${user.getPrincipal().toText()}`;

				const doc: SetDoc = {
					data: await toArray({
						banned: 'invalid'
					}),
					description: toNullable(),
					version: toNullable()
				};

				await expect(set_doc('#user-admin', key, doc)).rejects.toThrow(
					'Invalid user admin data: unknown variant `invalid`, expected `indefinite` at line 1 column 19.'
				);
			});

			it('should not set usage with invalid additional data fields', async () => {
				const { set_doc } = actor;

				const key = `${user.getPrincipal().toText()}`;

				const doc: SetDoc = {
					data: await toArray({
						banned: 'indefinite',
						unknown: 'field'
					}),
					description: toNullable(),
					version: toNullable()
				};

				await expect(set_doc('#user-admin', key, doc)).rejects.toThrow(
					'Invalid user admin data: unknown field `unknown`, expected `banned` at line 1 column 32.'
				);
			});
		});
	});

	describe.only('Ban', () => {
		const collection = 'test_banned';

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_rule } = actor;

			await set_rule({ Db: null }, collection, mockSetRule);
			await set_rule({ Storage: null }, collection, mockSetRule);
		});

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

		const banUser = async (user: Identity) => {
			actor.setIdentity(controller);

			const { set_doc } = actor;

			await set_doc('#user-admin', user.getPrincipal().toText(), {
				data: await toArray({
					banned: 'indefinite'
				}),
				description: toNullable(),
				version: toNullable()
			});
		};

		describe('get document', () => {
			it.only('should not get document if banned', async () => {
				const user = Ed25519KeyIdentity.generate();

				await createUser(user);

				const { set_doc } = actor;

				const key = nanoid();

				await set_doc(collection, key, {
					data: await toArray({
						hello: 'world'
					}),
					description: toNullable(),
					version: toNullable()
				});

				await banUser(user);

				actor.setIdentity(user);
				const { get_doc } = actor;

				const result = await get_doc(collection, key);
				const doc = fromNullable(result);

				expect(doc).toBeUndefined();
			});
		});
	});
});
