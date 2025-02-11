import type { _SERVICE as SatelliteActor, SetDoc } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { beforeAll, describe, expect, inject } from 'vitest';
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

					await expect(set_doc('#user-admin', key, doc)).rejects.toThrow('Cannot write.');
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
});
