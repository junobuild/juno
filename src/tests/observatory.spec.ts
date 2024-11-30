import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { ANONYMOUS_ERROR_MSG } from './constants/observatory-tests.constants';
import { OBSERVATORY_WASM_PATH } from './utils/setup-tests.utils';

describe('Observatory', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactorObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on set crontab', async () => {
			const { set_cron_tab } = actor;

			await expect(
				set_cron_tab({
					cron_jobs: {
						metadata: [],
						statuses: {
							mission_control_cycles_threshold: [],
							orbiters: [],
							satellites: [],
							enabled: false,
							cycles_threshold: []
						}
					},
					mission_control_id: Ed25519KeyIdentity.generate().getPrincipal(),
					version: []
				})
			).rejects.toThrow(ANONYMOUS_ERROR_MSG);
		});

		it('should throw errors on get crontab', async () => {
			const { get_cron_tab } = actor;

			await expect(get_cron_tab()).rejects.toThrow(ANONYMOUS_ERROR_MSG);
		});

		it('should throw errors on get statuses', async () => {
			const { get_statuses } = actor;

			await expect(get_statuses()).rejects.toThrow(ANONYMOUS_ERROR_MSG);
		});
	});

	describe('owner', () => {
		const owner = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(owner);
		});

		it('should not throw errors on get crontab', async () => {
			const { get_cron_tab } = actor;

			await expect(get_cron_tab()).resolves.not.toThrow(ANONYMOUS_ERROR_MSG);
		});

		it('should not throw errors on get statuses', async () => {
			const { get_statuses } = actor;

			await expect(get_statuses()).resolves.not.toThrow(ANONYMOUS_ERROR_MSG);
		});
	});
});
