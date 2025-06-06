import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { _SERVICE as ConsoleActor_0_0_14 } from '$declarations/deprecated/console-0-0-14.did';
import { idlFactory as idlFactoryConsole_0_0_14 } from '$declarations/deprecated/console-0-0-14.factory.did';
import type { _SERVICE as ConsoleActor_0_0_8 } from '$declarations/deprecated/console-0-0-8-patch1.did';
import { idlFactory as idlFactorConsole_0_0_8 } from '$declarations/deprecated/console-0-0-8-patch1.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { mockScript } from '../../mocks/storage.mocks';
import {
	assertAssetServed,
	deploySegments,
	initMissionControls,
	installReleasesWithDeprecatedFlow,
	testSatelliteExists,
	uploadFileWithProposal
} from '../../utils/console-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	controllersInitArgs,
	downloadConsole
} from '../../utils/setup-tests.utils';

describe('Console > Upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor_0_0_8>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgradeVersion = async (params: { junoVersion: string; version: string }) => {
		await tick(pic);

		const destination = await downloadConsole(params);

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const testUsers = async ({
		actor,
		users
	}: {
		users: Identity[];
		actor: Actor<ConsoleActor_0_0_8 | ConsoleActor_0_0_14 | ConsoleActor>;
	}) => {
		const { list_user_mission_control_centers } = actor;

		const missionControls = await list_user_mission_control_centers();

		expect(missionControls).toHaveLength(users.length);

		for (const user of users) {
			expect(
				missionControls.find(([key]) => key.toText() === user.getPrincipal().toText())
			).not.toBeUndefined();
		}
	};

	const updateRateConfig = async ({
		actor
	}: {
		actor: Actor<ConsoleActor_0_0_8 | ConsoleActor_0_0_14 | ConsoleActor>;
	}) => {
		const { update_rate_config } = actor;

		const config = {
			max_tokens: 100n,
			time_per_token_ns: 60n
		};

		await update_rate_config({ Satellite: null }, config);
		await update_rate_config({ Orbiter: null }, config);
		await update_rate_config({ MissionControl: null }, config);
	};

	const testProposal = async ({
		actor,
		proposalId
	}: {
		proposalId: bigint;
		actor: Actor<ConsoleActor_0_0_14 | ConsoleActor>;
	}) => {
		const { get_proposal } = actor;

		const proposal = fromNullable(await get_proposal(proposalId));

		assertNonNullish(proposal);

		expect(proposal.status).toEqual({ Executed: null });
		expect(fromNullable(proposal.sha256)).not.toBeUndefined();
		expect(fromNullable(proposal.executed_at)).not.toBeUndefined();
		expect(fromNullable(proposal.executed_at)).toBeGreaterThan(0n);
		expect(proposal.owner.toText()).toEqual(controller.getPrincipal().toText());
		expect('AssetsUpgrade' in proposal.proposal_type).toBeTruthy();
		expect(proposal.created_at).not.toBeUndefined();
		expect(proposal.created_at).toBeGreaterThan(0n);
		expect(proposal.updated_at).not.toBeUndefined();
		expect(proposal.updated_at).toBeGreaterThan(0n);
		expect(fromNullable(proposal.version) ?? 0n).toBeGreaterThan(0n);
	};

	describe('v0.0.8 -> v0.0.9', () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadConsole({ junoVersion: '0.0.30', version: '0.0.8' });

			const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor_0_0_8>({
				idlFactory: idlFactorConsole_0_0_8,
				wasm: destination,
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);

			await installReleasesWithDeprecatedFlow(actor);

			await updateRateConfig({ actor });
		});

		describe('Heap state', () => {
			it(
				'should still list mission controls',
				{
					timeout: 120000
				},
				async () => {
					// We need to advance time for the rate limiter
					await pic.advanceTime(1000);

					const originalUsers = await initMissionControls({ actor, pic, length: 3 });

					actor.setIdentity(controller);

					await testUsers({ users: originalUsers, actor });

					await testSatelliteExists({
						users: originalUsers,
						actor,
						pic
					});

					await upgradeVersion({ junoVersion: '0.0.31', version: '0.0.9' });

					// Moving from 0.0.8 to 0.0.9 we are on purpose deprecating previous ways to hold wasm in memory
					// await testReleases(actor);

					await testUsers({ users: originalUsers, actor });

					await testSatelliteExists({
						users: originalUsers,
						actor,
						pic
					});
				}
			);
		});
	});

	describe('v0.0.14 -> v0.1.0', () => {
		let actor: Actor<ConsoleActor_0_0_14>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadConsole({ junoVersion: '0.0.37', version: '0.0.14' });

			const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor_0_0_14>({
				idlFactory: idlFactoryConsole_0_0_14,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);

			await updateRateConfig({ actor });

			await deploySegments(actor);
		});

		it('should preserve controllers even if scope enum is extended', async () => {
			const user1 = Ed25519KeyIdentity.generate();
			const user2 = Ed25519KeyIdentity.generate();
			const admin1 = Ed25519KeyIdentity.generate();

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Write: null },
					metadata: [['hello', 'world']],
					expires_at: []
				},
				controllers: [user1.getPrincipal(), user2.getPrincipal()]
			});

			await set_controllers({
				controller: {
					scope: { Admin: null },
					metadata: [['super', 'top']],
					expires_at: []
				},
				controllers: [admin1.getPrincipal()]
			});

			const assertControllers = async (actor: ConsoleActor) => {
				const { list_controllers } = actor;

				const controllers = await list_controllers();

				expect(
					controllers.find(([p, _]) => p.toText() === controller.getPrincipal().toText())
				).not.toBeUndefined();

				const assertWriteController = (controller: Principal) => {
					const maybeUser = controllers.find(([p, _]) => p.toText() === controller.toText());
					assertNonNullish(maybeUser);

					expect(maybeUser[1].scope).toEqual({ Write: null });
					expect(maybeUser[1].metadata).toEqual([['hello', 'world']]);
				};

				assertWriteController(user1.getPrincipal());
				assertWriteController(user2.getPrincipal());

				const maybeAdmin = controllers.find(
					([p, _]) => p.toText() === admin1.getPrincipal().toText()
				);
				assertNonNullish(maybeAdmin);

				expect(maybeAdmin[1].scope).toEqual({ Admin: null });
				expect(maybeAdmin[1].metadata).toEqual([['super', 'top']]);
			};

			await upgrade();

			const newActor = pic.createActor<ConsoleActor>(idlFactorConsole, canisterId);
			newActor.setIdentity(controller);

			await assertControllers(newActor);
		});

		describe('Clear stable memory of proposals', () => {
			it(
				'should still list mission controls even if we alterate other memory IDs',
				{
					timeout: 120000
				},
				async () => {
					// We need to advance time for the rate limiter
					await pic.advanceTime(1000);

					const originalUsers = await initMissionControls({ actor, pic, length: 3 });

					actor.setIdentity(controller);

					await testUsers({ users: originalUsers, actor });

					await testSatelliteExists({
						users: originalUsers,
						actor,
						pic
					});

					await upgrade();

					const newActor = pic.createActor<ConsoleActor>(idlFactorConsole, canisterId);
					newActor.setIdentity(controller);

					await testUsers({ users: originalUsers, actor: newActor });

					await testSatelliteExists({
						users: originalUsers,
						actor,
						pic
					});
				}
			);

			it('should clear proposal', async () => {
				const { proposalId } = await uploadFileWithProposal({ actor, pic });

				await testProposal({ actor, proposalId });

				await upgrade();

				const { get_proposal } = actor;

				const proposal = await get_proposal(proposalId);

				expect(fromNullable(proposal)).toBeUndefined();
			});

			it('should still serve asset', async () => {
				const { proposalId, fullPath } = await uploadFileWithProposal({ actor, pic });

				await testProposal({ actor, proposalId });

				await upgrade();

				await assertAssetServed({
					actor,
					fullPath,
					body: mockScript
				});
			});

			it('should be able to upload asset through proposal after upgrade', async () => {
				const fullPath = '/index-123456.js';

				await upgrade();

				const { proposalId: proposalIdAfterUpgrade } = await uploadFileWithProposal({
					actor,
					pic,
					fullPath
				});

				await testProposal({ actor, proposalId: proposalIdAfterUpgrade });

				await assertAssetServed({
					actor,
					fullPath,
					body: mockScript
				});
			});

			it('should restart proposal count', async () => {
				// We deployed the segment with a proposal before reaching this point
				const { proposalId: proposalOne } = await uploadFileWithProposal({
					actor,
					pic,
					fullPath: '/index.js'
				});

				expect(proposalOne).toEqual(2n);

				const { proposalId: proposalTwo } = await uploadFileWithProposal({
					actor,
					pic,
					fullPath: '/index1.js'
				});

				expect(proposalTwo).toEqual(3n);

				await upgrade();

				const { proposalId } = await uploadFileWithProposal({ actor, pic, fullPath: '/index2.js' });

				expect(proposalId).toEqual(1n);
			});
		});
	});
});
