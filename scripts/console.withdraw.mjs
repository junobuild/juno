#!/usr/bin/env node

import { consoleActor } from './actor.mjs';

const actor = await consoleActor();

const withdrawIcp = async () => {
	try {
		const { withdraw_icp } = actor;

		const result = await withdraw_icp();

		console.log('✅ ICP successfully withdrawn.');
		console.table(result);
	} catch (error) {
		console.error('❌ ICP cannot be withdrawn', error);
	}
};

const withdrawIcrc = async () => {
	try {
		const { withdrawIcrc } = actor;

		const result = await withdrawIcrc();

		console.log('✅ ICRC successfully withdrawn.');
		console.table(result);
	} catch (error) {
		console.error('❌ ICRC cannot be withdrawn', error);
	}
};

await withdrawIcp();
