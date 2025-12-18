import {
	idlFactoryConsole020,
	idlFactoryMissionControl,
	type ConsoleActor020,
	type MissionControlActor
} from '$declarations';
import type { MissionControlId } from '$lib/types/mission-control';
import { PocketIc, SubnetStateType, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import type { IcpLedgerCanisterOptions } from '@icp-sdk/canisters/ledger/icp';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../../constants/console-tests.constants';
import { deploySegments, updateRateConfig } from '../../../utils/console-tests.utils';
import { setupLedger, transferIcp } from '../../../utils/ledger-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	controllersInitArgs,
	downloadConsole
} from '../../../utils/setup-tests.utils';

type LedgerActor = IcpLedgerCanisterOptions['serviceOverride'];

describe('Console > Upgrade > Payments > v0.2.0 -> v0.3.0', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor020>;
	let canisterId: Principal;
	let ledgerActor: Actor<LedgerActor>;

	const controller = Ed25519KeyIdentity.generate();

	const user = Ed25519KeyIdentity.generate();

	const upgradeCurrent = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const createMissionControlAndSatellite = async ({
		user
	}: {
		user: Identity;
	}): Promise<{ missionControlId: MissionControlId }> => {
		actor.setIdentity(user);

		const { init_user_mission_control_center } = actor;
		const missionControl = await init_user_mission_control_center();

		const missionControlId = fromNullable(missionControl.mission_control_id);

		assertNonNullish(missionControlId);

		await createSatellite({ missionControlId });

		return { missionControlId };
	};

	const createSatellite = async ({ missionControlId }: { missionControlId: MissionControlId }) => {
		const micActor = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
			missionControlId
		);
		micActor.setIdentity(user);

		const { create_satellite } = micActor;
		await create_satellite('test');
	};

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'), {
			nns: {
				enableBenchmarkingInstructionLimits: false,
				enableDeterministicTimeSlicing: false,
				state: { type: SubnetStateType.New }
			}
		});

		const destination = await downloadConsole({ junoVersion: '0.0.62', version: '0.2.0' });

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor020>({
			idlFactory: idlFactoryConsole020,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal(),
			targetCanisterId: CONSOLE_ID
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);

		await updateRateConfig({ actor });

		await deploySegments({ actor });

		const { actor: lA } = await setupLedger({ pic, controller });

		ledgerActor = lA;

		// Create mission control requires the user to be a caller of the Console
		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should still list payments', async () => {
		const { missionControlId } = await createMissionControlAndSatellite({ user });

		await transferIcp({
			ledgerActor,
			owner: missionControlId
		});

		await createSatellite({ missionControlId });

		actor.setIdentity(controller);

		const { list_payments } = actor;
		const payments = await list_payments();

		expect(payments).toHaveLength(1);
		expect(payments[0][0]).toEqual(2n);
		expect(payments[0][1].block_index_payment).toEqual(2n);
		expect(payments[0][1].block_index_refunded).toEqual([]);
		expect(payments[0][1].created_at > 0n).toBeTruthy();
		expect(payments[0][1].updated_at > 0n).toBeTruthy();
		expect(fromNullable(payments[0][1].mission_control_id)?.toText()).toEqual(
			missionControlId.toText()
		);
		expect(payments[0][1].status).toEqual({ Completed: null });
	});
});
