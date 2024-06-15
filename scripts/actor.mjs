import pkgAgent from '@dfinity/agent';
import pkgPrincipal from '@dfinity/principal';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { idlFactory } from '../src/declarations/console/console.factory.did.mjs';
import { idlFactory as icIdlFactory } from '../src/declarations/ic/ic.factory.did.mjs';
import { idlFactory as observatoryIdlFactory } from '../src/declarations/observatory/observatory.factory.did.mjs';
import { idlFactory as orbiterIdlFactory } from '../src/declarations/orbiter/orbiter.factory.did.mjs';
import { getIdentity } from './console.config.utils.mjs';
import { CONSOLE_ID } from './constants.mjs';
import { initIdentity } from './identity.utils.mjs';

const { HttpAgent, Actor } = pkgAgent;
const { Principal } = pkgPrincipal;

const observatoryPrincipalIC = () => {
	const buffer = readFileSync('./canister_ids.json');
	const { observatory } = JSON.parse(buffer.toString('utf-8'));
	return Principal.fromText(observatory.ic);
};

const observatoryPrincipalLocal = () => {
	const buffer = readFileSync('./.dfx/local/canister_ids.json');
	const { observatory } = JSON.parse(buffer.toString('utf-8'));
	return Principal.fromText(observatory.local);
};

export const consoleActorIC = async () => {
	const agent = icAgent();

	return Actor.createActor(idlFactory, {
		agent,
		canisterId: CONSOLE_ID
	});
};

export const icAgent = () => {
	const identity = initIdentity(true);

	console.log('IC identity:', identity.getPrincipal().toText());

	return new HttpAgent({ identity, fetch, host: 'https://icp0.io' });
};

export const localAgent = async () => {
	const identity = getIdentity();

	console.log('Local identity:', identity.getPrincipal().toText());

	const agent = new HttpAgent({ identity, fetch, host: 'http://127.0.0.1:5987/' });

	await agent.fetchRootKey();

	return agent;
};

export const consoleActorLocal = async () => {
	const agent = await localAgent(false);

	return Actor.createActor(idlFactory, {
		agent,
		canisterId: CONSOLE_ID
	});
};

export const observatoryActorIC = async () => {
	const canisterId = observatoryPrincipalIC();

	const agent = icAgent();

	return Actor.createActor(observatoryIdlFactory, {
		agent,
		canisterId
	});
};

export const observatoryActorLocal = async () => {
	const canisterId = observatoryPrincipalLocal();

	const agent = await localAgent(false);

	return Actor.createActor(observatoryIdlFactory, {
		agent,
		canisterId
	});
};

export const orbiterActorIC = async (canisterId) => {
	const agent = icAgent();

	return Actor.createActor(orbiterIdlFactory, {
		agent,
		canisterId
	});
};

export const orbiterActorLocal = async (canisterId) => {
	const agent = await localAgent(false);

	return Actor.createActor(orbiterIdlFactory, {
		agent,
		canisterId
	});
};

const MANAGEMENT_CANISTER_ID = Principal.fromText('aaaaa-aa');

// Source nns-dapp - dart -> JS bridge
const transform = (_methodName, args, _callConfig) => {
	const first = args[0];
	let effectiveCanisterId = MANAGEMENT_CANISTER_ID;
	if (first && typeof first === 'object' && first.canister_id) {
		effectiveCanisterId = Principal.from(first.canister_id);
	}

	return { effectiveCanisterId };
};

export const icActorIC = async () => {
	const agent = icAgent();

	return Actor.createActor(icIdlFactory, {
		agent,
		canisterId: MANAGEMENT_CANISTER_ID,
		config: {
			callTransform: transform,
			queryTransform: transform
		}
	});
};
