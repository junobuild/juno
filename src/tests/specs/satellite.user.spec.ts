import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity, type Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { USER_CANNOT_WRITE } from './constants/satellite-tests.constants';
import { SATELLITE_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Satellite > User', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor>({
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
		});

		describe('error', () => {
			describe('key', () => {
				const user = Ed25519KeyIdentity.generate();

				beforeAll(() => {
					actor.setIdentity(controller);
				});

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
					).rejects.toThrow('Caller and key must match to create a user.');
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
					).rejects.toThrow('User key must be a textual representation of a principal.');
				});
			});

			describe('data', () => {
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
						'Invalid user data: unknown variant `unknown`, expected `internet_identity` or `nfid` at line 1 column 21.'
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
						'Invalid user data: unknown field `unknown`, expected `provider` at line 1 column 41.'
					);
				});
			});
		});
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should not create a user', async () => {
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
			).rejects.toThrow(USER_CANNOT_WRITE);
		});
	});
});
