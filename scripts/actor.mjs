import pkgAgent from '@dfinity/agent';
import pkgPrincipal from '@dfinity/principal';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { idlFactory } from '../src/declarations/console/console.factory.did.mjs';
import { idlFactory as observatoryIdlFactory } from '../src/declarations/observatory/observatory.factory.did.mjs';
import { initIdentity } from './identity.utils.mjs';

const { HttpAgent, Actor } = pkgAgent;
const { Principal } = pkgPrincipal;

const consolePrincipalIC = () => {
	const buffer = readFileSync('./canister_ids.json');
	const { console } = JSON.parse(buffer.toString('utf-8'));
	return Principal.fromText(console.ic);
};

const consolePrincipalLocal = () => {
	const buffer = readFileSync('./.dfx/local/canister_ids.json');
	const { console } = JSON.parse(buffer.toString('utf-8'));
	return Principal.fromText(console.local);
};

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
	const canisterId = consolePrincipalIC();

	const agent = icAgent();

	return Actor.createActor(idlFactory, {
		agent,
		canisterId
	});
};

export const icAgent = () => {
	const identity = initIdentity(true);

	return new HttpAgent({ identity, fetch, host: 'https://icp0.io' });
};

export const localAgent = async () => {
	const identity = initIdentity(false);

	const agent = new HttpAgent({ identity, fetch, host: 'http://127.0.0.1:8000/' });

	await agent.fetchRootKey();

	return agent;
};

export const consoleActorLocal = async () => {
	const canisterId = consolePrincipalLocal();

	const agent = await localAgent(false);

	return Actor.createActor(idlFactory, {
		agent,
		canisterId
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
