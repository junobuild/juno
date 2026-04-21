#!/usr/bin/env node

import { Principal } from '@icp-sdk/core/principal';
import { nextArg } from '@junobuild/cli-tools';
import { consoleActor } from './actor.mjs';

const args = process.argv.slice(2);
const to = nextArg({ args, option: '--to' });

const withdrawArgs = { to: Principal.fromText(to) };

const actor = await consoleActor();

const withdrawIcp = async () => {
	try {
		const { withdraw_icp } = actor;

		const result = await withdraw_icp(withdrawArgs);

		console.log('✅ ICP successfully withdrawn.');
		console.table(result);
	} catch (error) {
		console.error('❌ ICP cannot be withdrawn', error);
	}
};

const withdrawIcrc = async () => {
	try {
		const { withdrawIcrc } = actor;

		const result = await withdrawIcrc(withdrawArgs);

		console.log('✅ ICRC successfully withdrawn.');
		console.table(result);
	} catch (error) {
		console.error('❌ ICRC cannot be withdrawn', error);
	}
};

await withdrawIcp();
await withdrawIcrc();
