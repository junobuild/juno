import { Actor, AnonymousIdentity, HttpAgent } from '@dfinity/agent';
/* eslint-disable */
import { idlFactory } from '../src/declarations/console/console.factory.did.mjs';
import { idlFactory as observatoryIdlFactory } from '../src/declarations/observatory/observatory.factory.did.mjs';
import { idlFactory as orbiterIdlFactory } from '../src/declarations/orbiter/orbiter.factory.did.mjs';
/* eslint-enable */
import { getIdentity } from './console.config.utils.mjs';
import { CONSOLE_ID, OBSERVATORY_ID } from './constants.mjs';
import { targetMainnet } from './utils.mjs';

export const icAgent = async () => {
	const identity = await getIdentity(true);

	console.log('IC identity:', identity.getPrincipal().toText());

	return await HttpAgent.create({ identity, fetch, host: 'https://icp-api.io' });
};

export const icAnonymousAgent = async () =>
	await HttpAgent.create({
		identity: new AnonymousIdentity(),
		fetch,
		host: 'https://icp-api.io'
	});

export const localAgent = async () => {
	const identity = await getIdentity(false);

	console.log('Local identity:', identity.getPrincipal().toText());

	const agent = await HttpAgent.create({ identity, fetch, host: 'http://127.0.0.1:5987/' });

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
