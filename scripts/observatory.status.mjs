#!/usr/bin/env node

import { observatoryActorIC, observatoryActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const notifyStatus = async (mainnet) => {
	const { get_notify_status } = await (mainnet ? observatoryActorIC() : observatoryActorLocal());

	const status = await get_notify_status({
		segment_id: [],
		from: [],
		to: []
	});

	console.log('Notification status:', status);
};

const mainnet = targetMainnet();

await notifyStatus(mainnet);
