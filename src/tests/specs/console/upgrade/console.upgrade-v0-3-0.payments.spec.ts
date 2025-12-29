import {
	idlFactoryConsole,
	idlFactoryConsole020,
	idlFactoryMissionControl,
	type ConsoleActor,
	type ConsoleActor020,
	type ConsoleDid,
	type ConsoleDid020,
	type MissionControlActor
} from '$declarations';
import type { MissionControlId } from '$lib/types/mission-control';
import { IcpFeaturesConfig, PocketIc, SubnetStateType, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../../constants/console-tests.constants';
import { ICP_LEDGER_ID } from '../../../constants/ledger-tests.contants';
import { deploySegments, updateRateConfig } from '../../../utils/console-tests.utils';
import { transferIcp } from '../../../utils/ledger-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import {
	CONSOLE_WASM_PATH,
	controllersInitArgs,
	downloadConsole
} from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > Payments > v0.2.0 -> v0.3.0', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor020>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const user = Ed25519KeyIdentity.generate();

	let missionControlId: MissionControlId;

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

		await createSatellite({ missionControlId, user });

		return { missionControlId };
	};

	const createSatellite = async ({
		missionControlId,
		user
	}: {
		missionControlId: MissionControlId;
		user: Identity;
	}) => {
		const micActor = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
			missionControlId
		);
		micActor.setIdentity(user);

		const { create_satellite } = micActor;
		await create_satellite('test');
	};

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

		// Create mission control requires the user to be a caller of the Console
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should still list payments', async () => {
		const { missionControlId: mId } = await createMissionControlAndSatellite({ user });

		missionControlId = mId;

		await transferIcp({
			pic,
			owner: missionControlId
		});

		await createSatellite({ missionControlId, user });

		const assertPayments = (
			payments: [bigint, ConsoleDid.IcpPayment][] | [bigint, ConsoleDid020.Payment][]
		) => {
			expect(payments).toHaveLength(1);
			expect(payments[0][0]).toEqual(4n);
			expect(payments[0][1].block_index_payment).toEqual(4n);
			// There was likely a trivial issue since genesis where the block index was saved as refunded
			// when we marked the payment as completed. This is fixed with new version.
			expect(payments[0][1].block_index_refunded).toEqual([4n]);
			expect(payments[0][1].created_at > 0n).toBeTruthy();
			expect(payments[0][1].updated_at > 0n).toBeTruthy();
			expect(fromNullable(payments[0][1].mission_control_id)?.toText()).toEqual(
				missionControlId.toText()
			);
			expect(payments[0][1].status).toEqual({ Completed: null });
		};

		actor.setIdentity(controller);

		const { list_payments } = actor;
		const payments = await list_payments();

		assertPayments(payments);

		await upgradeCurrent();

		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		const { list_icp_payments } = newActor;
		const icpPayments = await list_icp_payments();

		assertPayments(icpPayments);
	});

	it('should set payments as completed with new interface', async () => {
		assertNonNullish(missionControlId);

		await createSatellite({ missionControlId, user });

		const newActor = pic.createActor<ConsoleActor>(idlFactoryConsole, canisterId);
		newActor.setIdentity(controller);

		const { list_icp_payments, list_icrc_payments } = newActor;
		const icpPayments = await list_icp_payments();
		const icrcPayments = await list_icrc_payments();

		expect(icpPayments).toHaveLength(1);
		expect(icrcPayments).toHaveLength(1);

		const payment = icrcPayments.find(
			([{ ledger_id, block_index }]) =>
				block_index === 5n && ledger_id.toText() === ICP_LEDGER_ID.toText()
		);

		assertNonNullish(payment);

		expect(payment[1].purchaser.owner.toText()).toEqual(missionControlId.toText());
		expect(payment[1].block_index_refunded).toEqual([]);
		expect(payment[1].created_at > 0n).toBeTruthy();
		expect(payment[1].updated_at > 0n).toBeTruthy();
		expect(payment[1].status).toEqual({ Completed: null });
	});
});
