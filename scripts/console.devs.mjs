#!/usr/bin/env node

import { fromNullable } from '@dfinity/utils';
import { format, startOfDay, toDate } from 'date-fns';
import { consoleActorIC, consoleActorLocal } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const prepareStats = ({ allDevs, from }) => {
	const startDate = startOfDay(toDate(from));
	const startDateBigIntNanoSeconds = BigInt(startDate.getTime()) * BigInt(1e6);

	const devs = allDevs.filter(([_, dev]) => dev.created_at > startDateBigIntNanoSeconds);

	return { devs, formattedDate: format(startDate, 'MM/dd/yyyy') };
};

const statsGoogleDevs = (allDevs) => {
	const { devs, formattedDate } = prepareStats({ allDevs, from: '2025-10-25T08:00:00' });

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

	console.log(`Developers since ${formattedDate}:`, devs.length);
	console.log('Internet Identity:', ii.length);
	console.log('Google:', google.length);
};

const statsGitHubDevs = (allDevs) => {
	const { devs, formattedDate } = prepareStats({ allDevs, from: '2026-01-23T15:00:00' });

	const [ii, google, github] = devs.reduce(
		(acc, current) => {
			const [ii, google, github] = acc;

			const provider = fromNullable(current[1]?.provider);

			const isGoogle = 'OpenId' in (provider ?? {}) && 'Google' in provider.OpenId.provider;
			const isGitHub = 'OpenId' in (provider ?? {}) && 'GitHub' in provider.OpenId.provider;

			return [
				[...ii, ...(isGoogle || isGitHub ? [] : [current])],
				[...google, ...(isGoogle ? [current] : [])],
				[...github, ...(isGitHub ? [current] : [])]
			];
		},
		[[], [], []]
	);

	console.log(`Developers since ${formattedDate}:`, devs.length);
	console.log('Internet Identity:', ii.length);
	console.log('Google:', google.length);
	console.log('GitHub:', github.length);
};

const countDevs = (devs) => {
	console.log('Developers:', devs.length);
};

const fetchDevs = async (mainnet) => {
	const { list_accounts } = await (mainnet ? consoleActorIC() : consoleActorLocal());
	return await list_accounts();
};

const mainnet = targetMainnet();

const devs = await fetchDevs(mainnet);

console.log('----------------------------');
countDevs(devs);

console.log('----------------------------');
statsGoogleDevs(devs);

console.log('----------------------------');
statsGitHubDevs(devs);
