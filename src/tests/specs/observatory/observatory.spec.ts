import { idlFactoryObservatory, type ObservatoryActor } from '$lib/api/actors/actor.factory';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { CALLER_NOT_CONTROLLER_OBSERVATORY_MSG } from '../../constants/observatory-tests.constants';
import { OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Observatory', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testGuards = () => {
		it('should throw errors on set controllers', async () => {
			const { set_controllers } = actor;

			await expect(
				set_controllers({
					controller: {
						scope: { Admin: null },
						metadata: [],
						expires_at: []
					},
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});

		it('should throw errors on delete controllers', async () => {
			const { del_controllers } = actor;

			await expect(
				del_controllers({
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});

		it('should throw errors on list controllers', async () => {
			const { list_controllers } = actor;

			await expect(list_controllers()).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});

		it('should throw errors on get notify status', async () => {
			const { get_notify_status } = actor;

			await expect(
				get_notify_status({
					segment_id: toNullable(),
					from: toNullable(),
					to: toNullable()
				})
			).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});

		it('should throw errors on ping', async () => {
			const { ping } = actor;

			await expect(
				ping({
					user: Principal.fromText('bnz7o-iuaaa-aaaaa-qaaaa-cai'),
					segment: {
						id: Principal.fromText(
							'plrof-3btl5-tyr2o-pf5zm-qvidg-f3awf-fg4w6-xuipq-m34q3-27d6d-yqe'
						),
						kind: { Satellite: null },
						metadata: []
					},
					kind: {
						DepositedCyclesEmail: {
							to: 'test@test.com',
							deposited_cycles: {
								timestamp: 1704032400000000000n,
								amount: 100_456_000_000n
							}
						}
					}
				})
			).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});

		it('should throw errors on set env', async () => {
			const { set_env } = actor;

			await expect(
				set_env({
					email_api_key: ['secret']
				})
			).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});
	};

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testGuards();
	});

	describe('user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		testGuards();
	});
});
