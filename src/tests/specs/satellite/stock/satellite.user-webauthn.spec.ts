import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import type { Identity, SignIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import {
	arrayBufferToUint8Array,
	arrayOfNumberToUint8Array,
	assertNonNullish,
	fromNullable,
	toNullable
} from '@dfinity/utils';
import {
	JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CALLER_KEY,
	JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CANNOT_UPDATE,
	JUNO_DATASTORE_ERROR_USER_WEBAUTHN_INVALID_DATA
} from '@junobuild/errors';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > User Webauthn', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const createUserWebAuthn = async ({
		publicKey,
		aaguid,
		credentialId
	}: {
		publicKey: Uint8Array;
		aaguid?: number[];
		credentialId: string;
	}) => {
		const { set_doc } = actor;

		await set_doc('#user-webauthn', credentialId, {
			data: await toArray({
				publicKey,
				aaguid
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

	describe('Set', () => {
		let user: SignIdentity;
		let userPublicKey: Uint8Array;
		let credentialId: string;

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			userPublicKey = arrayBufferToUint8Array(user.getPublicKey().toDer());

			credentialId = nanoid();
		});

		describe('#user-webauthn', () => {
			it('should create user-webauthn with public key', async () => {
				await createUserWebAuthn({ publicKey: userPublicKey, credentialId });

				const { get_doc } = actor;

				const doc = fromNullable(await get_doc('#user-webauthn', credentialId));

				expect(doc).not.toBeUndefined();

				const data = await fromArray(doc?.data ?? []);

				expect((data as { publicKey: Uint8Array }).publicKey).toEqual(userPublicKey);
			});

			it('should not create a user-webauthn with invalid additional data fields', async () => {
				const { set_doc } = actor;

				const data = await toArray({
					publicKey: userPublicKey,
					unknown: 'field'
				});

				await expect(
					set_doc('#user-webauthn', credentialId, {
						data,
						description: toNullable(),
						version: toNullable()
					})
				).rejects.toThrow(
					new RegExp(
						`${JUNO_DATASTORE_ERROR_USER_WEBAUTHN_INVALID_DATA}: unknown field \`unknown\`, expected \`publicKey\``,
						'i'
					)
				);
			});

			it('should not create a user-webauthn without public key', async () => {
				const { set_doc } = actor;

				const data = await toArray({});

				await expect(
					set_doc('#user-webauthn', credentialId, {
						data,
						description: toNullable(),
						version: toNullable()
					})
				).rejects.toThrow(
					new RegExp(
						`${JUNO_DATASTORE_ERROR_USER_WEBAUTHN_INVALID_DATA}: missing field \`publicKey\` at line 1 column 2`,
						'i'
					)
				);
			});

			it('should not update user-webauthn', async () => {
				await createUserWebAuthn({ publicKey: userPublicKey, credentialId });

				const { set_doc } = actor;

				await expect(
					set_doc('#user-webauthn', credentialId, {
						data: await toArray({
							publicKey: userPublicKey
						}),
						description: toNullable(),
						version: toNullable(1n)
					})
				).rejects.toThrow(JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CANNOT_UPDATE);
			});

			describe('AAGUID', () => {
				const AAGUID_ZERO = new Array(16).fill(0);

				// deadbeef-0001-0203-0405-060708090a0b
				const AAGUID = [
					0xde, 0xad, 0xbe, 0xef, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
					0x0b
				];

				const INVALID_AAGUID_LEN_15 = new Array(15).fill(0);
				const INVALID_AAGUID_LEN_17 = new Array(17).fill(0);

				it('should create user-webauthn with valid aaguid', async () => {
					await createUserWebAuthn({ publicKey: userPublicKey, credentialId, aaguid: AAGUID });

					const { get_doc } = actor;

					const doc = fromNullable(await get_doc('#user-webauthn', credentialId));

					expect(doc).not.toBeUndefined();

					const data = await fromArray(doc?.data ?? []);

					expect((data as { aaguid: number[] }).aaguid).toEqual(AAGUID);
				});

				it('should create user-webauthn with aaguid zero (some providers intentionally set it to zero)', async () => {
					await createUserWebAuthn({ publicKey: userPublicKey, credentialId, aaguid: AAGUID_ZERO });

					const { get_doc } = actor;

					const doc = fromNullable(await get_doc('#user-webauthn', credentialId));

					expect(doc).not.toBeUndefined();

					const data = await fromArray(doc?.data ?? []);

					expect((data as { aaguid: number[] }).aaguid).toEqual(AAGUID_ZERO);
				});

				it('should not create a user-webauthn with aaguid too short', async () => {
					const { set_doc } = actor;

					const data = await toArray({
						publicKey: userPublicKey,
						aaguid: INVALID_AAGUID_LEN_15
					});

					await expect(
						set_doc('#user-webauthn', credentialId, {
							data,
							description: toNullable(),
							version: toNullable()
						})
					).rejects.toThrow(
						new RegExp(`juno.datastore.error.user.webauthn.aaguid_invalid_length`, 'i')
					);
				});

				it('should not create a user-webauthn with aaguid too long', async () => {
					const { set_doc } = actor;

					const data = await toArray({
						publicKey: userPublicKey,
						aaguid: INVALID_AAGUID_LEN_17
					});

					await expect(
						set_doc('#user-webauthn', credentialId, {
							data,
							description: toNullable(),
							version: toNullable()
						})
					).rejects.toThrow(
						new RegExp(`juno.datastore.error.user.webauthn.aaguid_invalid_length`, 'i')
					);
				});
			});
		});

		describe('#user-webauthn-index', () => {
			it('should create index for user-webauthn', async () => {
				await createUserWebAuthn({ publicKey: userPublicKey, credentialId });

				actor.setIdentity(controller);
				const { get_doc } = actor;

				const doc = fromNullable(
					await get_doc('#user-webauthn-index', user.getPrincipal().toText())
				);

				expect(doc).not.toBeUndefined();
			});

			it('should use field description to store the credential id in the index', async () => {
				await createUserWebAuthn({ publicKey: userPublicKey, credentialId });

				actor.setIdentity(controller);
				const { get_doc } = actor;

				const doc = fromNullable(
					await get_doc('#user-webauthn-index', user.getPrincipal().toText())
				);

				assertNonNullish(doc);

				expect(fromNullable(doc.description)).toEqual(credentialId);
			});

			it('should create index for user-webauthn with empty data', async () => {
				await createUserWebAuthn({ publicKey: userPublicKey, credentialId });

				actor.setIdentity(controller);
				const { get_doc } = actor;

				const doc = fromNullable(
					await get_doc('#user-webauthn-index', user.getPrincipal().toText())
				);

				expect(doc).not.toBeUndefined();

				expect(doc?.data).toBeInstanceOf(Uint8Array);
				expect(doc?.data).toHaveLength(0);
			});

			it('should not create user-webauthn with different public key', async () => {
				// Some other public key
				const publicKey = arrayOfNumberToUint8Array([1, 3, 5, 7, 8, 9]);

				await expect(createUserWebAuthn({ publicKey, credentialId })).rejects.toThrow(
					JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CALLER_KEY
				);
			});

			it('should not return webauthn index for non controller', async () => {
				await createUserWebAuthn({ publicKey: userPublicKey, credentialId });

				const { get_doc } = actor;

				const doc = fromNullable(
					await get_doc('#user-webauthn-index', user.getPrincipal().toText())
				);

				expect(doc).toBeUndefined();
			});
		});
	});

	describe('Delete', () => {
		let user: SignIdentity;
		let userPublicKey: Uint8Array;
		let credentialId: string;

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

		beforeEach(async () => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			userPublicKey = arrayBufferToUint8Array(user.getPublicKey().toDer());

			credentialId = nanoid();

			await createUser(user);
			await createUserWebAuthn({ publicKey: userPublicKey, credentialId });
		});

		it('should delete user-webauthn on delete user', async () => {
			const { del_doc } = actor;

			await del_doc('#user', user.getPrincipal().toText(), {
				version: [1n]
			});

			const { get_doc } = actor;

			const doc = fromNullable(await get_doc('#user-webauthn', credentialId));

			expect(doc).toBeUndefined();
		});

		it('should delete user-webauthn-index on delete user', async () => {
			const { del_doc } = actor;

			await del_doc('#user', user.getPrincipal().toText(), {
				version: [1n]
			});

			actor.setIdentity(controller);

			const { get_doc } = actor;

			const doc = fromNullable(await get_doc('#user-webauthn-index', credentialId));

			expect(doc).toBeUndefined();
		});
	});
});
