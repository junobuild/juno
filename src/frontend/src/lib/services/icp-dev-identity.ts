import { IdbStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from '@icp-sdk/auth/client';
import { type Identity } from '@icp-sdk/core/agent';
import {
	DelegationChain,
	DelegationIdentity,
	ECDSAKeyIdentity,
	Ed25519KeyIdentity
} from '@icp-sdk/core/identity';
import { Principal } from '@icp-sdk/core/principal';
import { clear, createStore, entries, update } from 'idb-keyval';
import * as z from 'zod';

export const identifiersIdbStore = createStore('icp-dev-identifiers', 'icp-dev-identifiers-store');

const DevIdentifierSchema = z.string();

const DevIdentifierDataSchema = z.strictObject({
	createdAt: z.number(),
	updatedAt: z.number()
});

const IdentitySchema = z.custom<Identity>().refine(
	(identity) => {
		try {
			return Principal.isPrincipal(identity.getPrincipal());
		} catch {
			return false;
		}
	},
	{ message: 'Invalid Identity.' }
);

const UnsafeDevSignInResultSchema = z.strictObject({
	identity: IdentitySchema
});

const UnsafeDevSignInParamsSchema = z.strictObject({
	identifier: z.string().optional(),
	maxTimeToLiveInMilliseconds: z.number().positive().optional()
});

export type DevIdentifier = z.infer<typeof DevIdentifierSchema>;
export type DevIdentifierData = z.infer<typeof DevIdentifierDataSchema>;
export type UnsafeDevSignInResult = z.infer<typeof UnsafeDevSignInResultSchema>;
export type UnsafeDevSignInParams = z.infer<typeof UnsafeDevSignInParamsSchema>;

export class UnsafeDevSignInNotBrowserError extends Error {}
export class UnsafeDevSignInNotLocalhostError extends Error {}

// How long the delegation identity should remain valid?
// e.g. 7 days
const DELEGATION_IDENTITY_EXPIRATION_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

export const loadDevIdentifiers = (): Promise<[DevIdentifier, DevIdentifierData][]> =>
	entries<DevIdentifier, DevIdentifierData>(identifiersIdbStore);

export const clearDevIdentifiers = () => clear(identifiersIdbStore);

export const unsafeDevSignIn = async (
	params: UnsafeDevSignInParams
): Promise<UnsafeDevSignInResult> => {
	const { identifier = 'dev', maxTimeToLiveInMilliseconds } =
		UnsafeDevSignInParamsSchema.parse(params);

	const isBrowser = (): boolean => typeof window !== `undefined`;

	if (!isBrowser()) {
		throw new UnsafeDevSignInNotBrowserError();
	}

	const {
		location: { hostname }
	} = window;

	if (!['127.0.0.1', 'localhost'].includes(hostname)) {
		throw new UnsafeDevSignInNotLocalhostError();
	}
	await update(
		identifier,
		(value) => {
			const now = Date.now();

			return {
				createdAt: value?.createdAt ?? now,
				updatedAt: now
			};
		},
		identifiersIdbStore
	);

	const encoder = new TextEncoder();
	const seedBytes = encoder.encode(identifier.padEnd(32, '0').slice(0, 32));

	const rootIdentity = Ed25519KeyIdentity.generate(seedBytes);
	const sessionKey = await ECDSAKeyIdentity.generate({ extractable: false });

	const sessionLengthInMilliseconds =
		maxTimeToLiveInMilliseconds ?? DELEGATION_IDENTITY_EXPIRATION_IN_MILLISECONDS;

	const chain = await DelegationChain.create(
		rootIdentity,
		sessionKey.getPublicKey(),
		new Date(Date.now() + sessionLengthInMilliseconds)
	);

	const delegatedIdentity = DelegationIdentity.fromDelegation(sessionKey, chain);

	const storage = new IdbStorage();

	await Promise.all([
		storage.set(KEY_STORAGE_KEY, sessionKey.getKeyPair()),
		storage.set(KEY_STORAGE_DELEGATION, JSON.stringify(chain.toJSON()))
	]);

	return { identity: delegatedIdentity };
};
