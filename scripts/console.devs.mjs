#!/usr/bin/env node

import { fromNullable } from '@dfinity/utils';
import { format, startOfDay, toDate } from 'date-fns';
import { consoleActorIC, consoleActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const statsDevs = (allDevs) => {
	const startDate = startOfDay(toDate('2025-10-25T08:00:00'));
	const startDateBigIntNanoSeconds = BigInt(startDate.getTime()) * BigInt(1e6);

	const devs = allDevs.filter(([_, dev]) => dev.created_at > startDateBigIntNanoSeconds);

	const [ii, google] = devs.reduce(
		(acc, current) => {
			const [ii, google] = acc;

			const provider = fromNullable(current[1]?.provider);

			return [
				[...ii, ...('OpenId' in (provider ?? {}) ? [] : [current])],
				[...google, ...('OpenId' in (provider ?? {}) ? [current] : [])]
			];
		},
		[[], []]
	);

	console.log(`Developers since ${format(startDate, 'MM/dd/yyyy')}:`, devs.length);
	console.log('Internet Identity:', ii.length);
	console.log('Google:', google.length);
};

const countDevs = (devs) => {
	console.log('Developers:', devs.length);
};

const fetchDevs = async (mainnet) => {
	const actor = await (mainnet ? consoleActorIC() : consoleActorLocal());
	return await actor.list_user_mission_control_centers();
};

const mainnet = targetMainnet();

const devs = await fetchDevs(mainnet);

console.log('----------------------------');
countDevs(devs);

console.log('----------------------------');
statsDevs(devs);
