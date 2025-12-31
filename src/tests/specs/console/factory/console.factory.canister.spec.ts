import {
	type ConsoleActor,
	idlFactoryMissionControl,
	type MissionControlActor
} from '$declarations';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import {
	CONSOLE_ID,
	NO_ACCOUNT_ERROR_MSG,
	TEST_FEES
} from '../../../constants/console-tests.constants';
import { CYCLES_LEDGER_ID } from '../../../constants/ledger-tests.contants';
import { initUserAccountAndMissionControl, setupConsole } from '../../../utils/console-tests.utils';
import { approveToken, transferToken } from '../../../utils/ledger-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Console > Factory > Canister', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO
		} = await setupConsole({
			withApplyRateTokens: true,
			withLedger: true,
			withSegments: true,
			withFee: true
		});

		pic = p;

		controller = cO;

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const createSatelliteWithConsole = async ({ user }: { user: Identity }): Promise<Principal> => {
		const { create_satellite } = actor;

		return await create_satellite({
			user: user.getPrincipal(),
			block_index: toNullable(),
			name: toNullable(),
			storage: toNullable(),
			subnet_id: toNullable()
		});
	};

	const createOrbiterWithConsole = async ({ user }: { user: Identity }): Promise<Principal> => {
		const { create_orbiter } = actor;

		return await create_orbiter({
			user: user.getPrincipal(),
			block_index: toNullable(),
			name: toNullable(),
			subnet_id: toNullable()
		});
	};

	const createSatelliteWithMissionControl = async ({
		missionControlId,
		user
	}: {
		missionControlId: MissionControlId;
		user: Identity;
	}): Promise<Principal> => {
		const micActor = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
			missionControlId
		);
		micActor.setIdentity(user);

		const { create_satellite_with_config } = micActor;

		const { satellite_id } = await create_satellite_with_config({
			name: toNullable(),
			storage: toNullable(),
			subnet_id: toNullable()
		});

		return satellite_id;
	};

	const createOrbiterWithMissionControl = async ({
		missionControlId,
		user
	}: {
		missionControlId: MissionControlId;
		user: Identity;
	}): Promise<Principal> => {
		const micActor = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
			missionControlId
		);
		micActor.setIdentity(user);

		const { create_orbiter_with_config } = micActor;

		const { orbiter_id } = await create_orbiter_with_config({
			name: toNullable(),
			subnet_id: toNullable()
		});

		return orbiter_id;
	};

	const assertSegments = async ({
		title,
		segmentIds
	}: {
		title: string;
		segmentIds: Principal[];
	}) => {
		const { list_segments } = actor;

		const segments = await list_segments({
			segment_type: [title === 'Orbiter' ? { Orbiter: null } : { Satellite: null }],
			segment_id: []
		});

		expect(segments).toHaveLength(segmentIds.length);

		for (const segmentId of segmentIds) {
			expect(
				segments.find(([_, { segment_id }]) => segment_id.toText() === segmentId.toText())
			).not.toBeUndefined();
		}
	};

	describe.each([
		{
			title: 'Satellite',
			createFn: createSatelliteWithConsole,
			createFnWithMctrl: createSatelliteWithMissionControl
		},
		{
			title: 'Orbiter',
			createFn: createOrbiterWithConsole,
			createFnWithMctrl: createOrbiterWithMissionControl
		}
	])('$title', ({ title, createFn, createFnWithMctrl }) => {
		let user: Ed25519KeyIdentity;

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		describe('Assertions', () => {
			it('should fail with unknown account', async () => {
				await expect(
					createFn({
						user
					})
				).rejects.toThrowError(NO_ACCOUNT_ERROR_MSG);
			});

			it('should fail with no mission control', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				const anotherCaller = Ed25519KeyIdentity.generate();
				actor.setIdentity(anotherCaller);

				await expect(
					createFn({
						user
					})
				).rejects.toThrowError('No mission control center found');

				actor.setIdentity(user);
			});

			it('should fail with unknown caller', async () => {
				const { get_or_init_account, create_mission_control } = actor;

				await get_or_init_account();

				await create_mission_control({
					subnet_id: []
				});

				const anotherCaller = Ed25519KeyIdentity.generate();
				actor.setIdentity(anotherCaller);

				await expect(
					createFn({
						user
					})
				).rejects.toThrowError('Unknown caller');

				actor.setIdentity(user);
			});
		});

		describe('User', () => {
			it('should create with user', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				const id = await createFn({
					user
				});

				expect(id).not.toBeUndefined();

				await assertSegments({
					title,
					segmentIds: [id]
				});
			});

			it('should fail with without credits and payment', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				// First module works out
				await createFn({
					user
				});

				await pic.advanceTime(60_000);
				await tick(pic);

				// Second requires payment
				await expect(
					createFn({
						user
					})
				).rejects.toThrowError('InsufficientAllowance');
			});

			it('should fail without enough payment', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				// First module works out
				await createFn({
					user
				});

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: user.getPrincipal(),
					ledgerId: CYCLES_LEDGER_ID,
					amount: 2n * TEST_FEES.fee_cycles.e12s
				});

				await approveToken({
					pic,
					owner: user,
					spender: CONSOLE_ID,
					ledgerId: CYCLES_LEDGER_ID,
					amount: TEST_FEES.fee_cycles.e12s // Fees 100_000_000n are missing
				});

				await tick(pic);

				// Second requires full payment
				await expect(
					createFn({
						user
					})
				).rejects.toThrowError('InsufficientAllowance');
			});

			it('should succeed with payment', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				// First module works out
				const firstId = await createFn({
					user
				});

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: user.getPrincipal(),
					ledgerId: CYCLES_LEDGER_ID,
					amount: 2n * TEST_FEES.fee_cycles.e12s
				});

				await approveToken({
					pic,
					owner: user,
					spender: CONSOLE_ID,
					ledgerId: CYCLES_LEDGER_ID,
					amount: TEST_FEES.fee_cycles.e12s + 100_000_000n
				});

				await tick(pic);

				// Second uses payment
				const secondId = await createFn({
					user
				});

				expect(secondId).not.toBeUndefined();

				await assertSegments({
					title,
					segmentIds: [firstId, secondId]
				});
			});
		});

		describe('Mission Control', () => {
			const addCredits = async () => {
				actor.setIdentity(controller);

				// Spinning mission control requires credits or ICP as well
				const { add_credits } = actor;
				await add_credits(user.getPrincipal(), { e8s: 100_000_000n });

				actor.setIdentity(user);
			};

			let missionControlId: MissionControlId;

			beforeEach(async () => {
				const { missionControlId: mId } = await initUserAccountAndMissionControl({
					pic,
					actor,
					user
				});

				missionControlId = mId;

				await addCredits();
			});

			it('should create with mission control', async () => {
				const id = await createFnWithMctrl({
					user,
					missionControlId
				});

				expect(id).not.toBeUndefined();

				await assertSegments({
					title,
					segmentIds: [id]
				});
			});

			it('should fail with without credits and payment', async () => {
				// First module works out
				await createFnWithMctrl({
					user,
					missionControlId
				});

				await pic.advanceTime(60_000);
				await tick(pic);

				// Second requires payment
				await expect(
					createFnWithMctrl({
						user,
						missionControlId
					})
				).rejects.toThrowError('InsufficientFunds');
			});

			it('should fail without enough payment', async () => {
				// First module works out
				await createFnWithMctrl({
					user,
					missionControlId
				});

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: missionControlId,
					amount: TEST_FEES.fee_icp.e8s
				});

				await tick(pic);

				// Second requires full payment
				await expect(
					createFnWithMctrl({
						user,
						missionControlId
					})
				).rejects.toThrowError('InsufficientFunds');
			});

			it('should succeed with payment', async () => {
				// First module works out
				const firstId = await createFnWithMctrl({
					user,
					missionControlId
				});

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: missionControlId
				});

				await tick(pic);

				// Second uses payment
				const secondId = await createFnWithMctrl({
					user,
					missionControlId
				});

				expect(secondId).not.toBeUndefined();

				await assertSegments({
					title,
					segmentIds: [firstId, secondId]
				});
			});
		});
	});
});
