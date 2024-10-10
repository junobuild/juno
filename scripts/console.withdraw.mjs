#!/usr/bin/env node

import { consoleActorLocal } from './actor.mjs';

try {
	const { withdraw_payments } = await consoleActorLocal();

	await withdraw_payments();

	console.log('✅ Payments successfully withdrawn.');
} catch (error) {
	console.error('❌ Payments cannot be withdrawn', error);
}
