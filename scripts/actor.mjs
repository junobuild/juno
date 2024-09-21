import pkgAgent, { AnonymousIdentity } from '@dfinity/agent';
import pkgPrincipal from '@dfinity/principal';
import { idlFactory } from '../src/declarations/console/console.factory.did.mjs';
import { idlFactory as icIdlFactory } from '../src/declarations/ic/ic.factory.did.mjs';
import { idlFactory as observatoryIdlFactory } from '../src/declarations/observatory/observatory.factory.did.mjs';
import { idlFactory as orbiterIdlFactory } from '../src/declarations/orbiter/orbiter.factory.did.mjs';
import { getIdentity } from './console.config.utils.mjs';
import { CONSOLE_ID, OBSERVATORY_ID } from './constants.mjs';
import { targetMainnet } from './utils.mjs';

const { HttpAgent, Actor } = pkgAgent;
const { Principal } = pkgPrincipal;

export const icAgent = async () => {
	const identity = await getIdentity(true);

	console.log('IC identity:', identity.getPrincipal().toText());

	return new HttpAgent({ identity, fetch, host: 'https://icp0.io' });
};

export const icAnonymousAgent = async () => {
	return new HttpAgent({ identity: new AnonymousIdentity(), fetch, host: 'https://icp0.io' });
};

export const localAgent = async () => {
	const identity = await getIdentity(false);

	console.log('Local identity:', identity.getPrincipal().toText());

	const agent = new HttpAgent({ identity, fetch, host: 'http://127.0.0.1:5987/' });

	await agent.fetchRootKey();

	return agent;
};

export const consoleActor = async () => {
	if (targetMainnet()) {
		return await consoleActorIC();
	}

	return await consoleActorLocal();
};

export const consoleActorIC = async () => {
	const agent = await icAgent();

	return Actor.createActor(idlFactory, {
		agent,
		canisterId: CONSOLE_ID
	});
};

export const consoleActorLocal = async () => {
	const agent = await localAgent(false);

	return Actor.createActor(idlFactory, {
		agent,
		canisterId: CONSOLE_ID
	});
};

export const observatoryActorIC = async () => {
	const canisterId = OBSERVATORY_ID;

	const agent = await icAgent();

	return Actor.createActor(observatoryIdlFactory, {
		agent,
		canisterId
	});
};

export const observatoryActorLocal = async () => {
	const canisterId = OBSERVATORY_ID;

	const agent = await localAgent(false);

	return Actor.createActor(observatoryIdlFactory, {
		agent,
		canisterId
	});
};

export const orbiterActorIC = async (canisterId) => {
	const agent = await icAgent();

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
	const agent = await icAgent();

	return Actor.createActor(icIdlFactory, {
		agent,
		canisterId: MANAGEMENT_CANISTER_ID,
		config: {
			callTransform: transform,
			queryTransform: transform
		}
	});
};
