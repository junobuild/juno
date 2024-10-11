import type {
	_SERVICE as MissionControlActor,
	TransferArg,
	TransferArgs
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/mission-control-tests.constants';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control - Wallet', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	const to = Ed25519KeyIdentity.generate();

	const LEDGER_ID = Principal.fromText('ryjl3-tyaaa-aaaaa-aaaba-cai');

	const args: TransferArgs = {
		to: AccountIdentifier.fromPrincipal({ principal: to.getPrincipal() }).toUint8Array(),
		amount: { e8s: 100_000n },
		fee: { e8s: 10_000n },
		memo: 0n,
		created_at_time: [],
		from_subaccount: []
	};

	const arg: TransferArg = {
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
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer =>
			IDL.encode(
				[
					IDL.Record({
						user: IDL.Principal
					})
				],
				[{ user: incorrectUser.getPrincipal() }]
			);

		const { actor: c } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactorMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: userInitArgs(),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	const testIdentity = () => {
		it('should throw errors on icp transfer', async () => {
			const { icp_transfer } = actor;

			await expect(icp_transfer(args)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on icrc transfer', async () => {
			const { icrc_transfer } = actor;

			await expect(icrc_transfer(LEDGER_ID, arg)).rejects.toThrow(CONTROLLER_ERROR_MSG);
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
