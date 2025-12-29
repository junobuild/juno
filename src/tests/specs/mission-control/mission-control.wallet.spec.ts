import {
	idlFactoryMissionControl,
	type MissionControlActor,
	type MissionControlDid
} from '$declarations';
import { IcpFeaturesConfig, PocketIc, SubnetStateType, type Actor } from '@dfinity/pic';
import { AccountIdentifier } from '@icp-sdk/canisters/ledger/icp';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { ICP_LEDGER_ID } from '../../constants/ledger-tests.contants';
import { MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG } from '../../constants/mission-control-tests.constants';
import { transferIcp } from '../../utils/ledger-tests.utils';
import { missionControlUserInitArgs } from '../../utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Mission Control > Wallet', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;
	let missionControlId: Principal;

	const to = Ed25519KeyIdentity.generate();

	const args: MissionControlDid.TransferArgs = {
		to: AccountIdentifier.fromPrincipal({ principal: to.getPrincipal() }).toUint8Array(),
		amount: { e8s: 100_000n },
		fee: { e8s: 10_000n },
		memo: 0n,
		created_at_time: [],
		from_subaccount: []
	};

	const arg: MissionControlDid.TransferArg = {
		to: {
			owner: to.getPrincipal(),
			subaccount: []
		},
		amount: 100_000n,
		fee: [10_000n],
		memo: [],
		from_subaccount: [],
		created_at_time: []
	};

	const incorrectUser = Ed25519KeyIdentity.generate();
	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'), {
			nns: {
				enableBenchmarkingInstructionLimits: false,
				enableDeterministicTimeSlicing: false,
				state: { type: SubnetStateType.New }
			},
			icpFeatures: {
				icpToken: IcpFeaturesConfig.DefaultConfig,
				cyclesToken: IcpFeaturesConfig.DefaultConfig
			}
		});
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const initMissionControl = async (owner: Principal) => {
		const { actor: c, canisterId } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactoryMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: missionControlUserInitArgs(owner),
			sender: controller.getPrincipal()
		});

		actor = c;
		missionControlId = canisterId;
	};

	describe('Guards', () => {
		beforeAll(async () => {
			await initMissionControl(incorrectUser.getPrincipal());
		});

		const testIdentity = () => {
			it('should throw errors on icp transfer', async () => {
				const { icp_transfer } = actor;

				await expect(icp_transfer(args)).rejects.toThrow(
					MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG
				);
			});

			it('should throw errors on icrc transfer', async () => {
				const { icrc_transfer } = actor;

				await expect(icrc_transfer(ICP_LEDGER_ID, arg)).rejects.toThrow(
					MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG
				);
			});
		};

		describe('anonymous', () => {
			beforeAll(() => {
				actor.setIdentity(new AnonymousIdentity());
			});

			testIdentity();
		});

		describe('unknown identity', () => {
			beforeAll(() => {
				actor.setIdentity(Ed25519KeyIdentity.generate());
			});

			testIdentity();
		});
	});

	describe('owner', () => {
		beforeAll(async () => {
			await initMissionControl(controller.getPrincipal());

			actor.setIdentity(controller);
		});

		describe('InsufficientFunds', () => {
			it('should fail at icp transfer', async () => {
				const { icp_transfer } = actor;

				const result = await icp_transfer(args);

				if ('Ok' in result) {
					throw new Error('Unexpected result. Icp transfer should have failed.');
				}

				expect(result.Err).toEqual({
					InsufficientFunds: {
						balance: {
							e8s: 0n
						}
					}
				});
			});

			it('should fail at icrc transfer', async () => {
				const { icrc_transfer } = actor;

				const result = await icrc_transfer(ICP_LEDGER_ID, arg);

				if ('Ok' in result) {
					throw new Error('Unexpected result. Icrc transfer should have failed.');
				}

				expect(result.Err).toEqual({
					InsufficientFunds: {
						balance: 0n
					}
				});
			});
		});

		describe('Transfer success', () => {
			beforeAll(async () => {
				await transferIcp({
					pic,
					owner: missionControlId
				});
			});

			it('should execute icp transfer', async () => {
				const { icp_transfer } = actor;

				const result = await icp_transfer(args);

				if ('Err' in result) {
					throw new Error('Unexpected result. Icrc transfer should have succeeded.');
				}

				expect(result.Ok).toEqual(4n);
			});

			it('should execute icrc transfer', async () => {
				const { icrc_transfer } = actor;

				const result = await icrc_transfer(ICP_LEDGER_ID, arg);

				if ('Err' in result) {
					throw new Error('Unexpected result. Icrc transfer should have succeeded.');
				}

				expect(result.Ok).toEqual(5n);
			});
		});
	});
});
