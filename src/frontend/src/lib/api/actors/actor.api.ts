import { getAgent, type GetAgentParams } from '$lib/api/_agent/_agent.api';
import type { NullishIdentity } from '$lib/types/itentity';
import { assertNonNullish, isNullish } from '@dfinity/utils';
import type { Nullish } from '@dfinity/zod-schemas';
import { Actor, type ActorConfig, type ActorMethod, type ActorSubclass } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import { Principal } from '@icp-sdk/core/principal';

type CreateActorParams = {
	canisterId: string | Principal;
	idlFactory: IDL.InterfaceFactory;
	config?: Pick<ActorConfig, 'callTransform' | 'queryTransform'>;
} & GetAgentParams;

export interface GetActorParams {
	certified?: boolean;
	identity: NullishIdentity;
}

export class ActorApi<T = Record<string, ActorMethod>> {
	#actors: Nullish<Record<string, ActorSubclass<T>>> = undefined;

	async getActor({
		identity,
		canisterId,
		certified = false,
		...rest
	}: Omit<CreateActorParams, 'identity'> & GetActorParams): Promise<ActorSubclass<T>> {
		assertNonNullish(identity, 'No internet identity to initialize the actor.');

		const identityText = identity.getPrincipal().toText();
		const canisterIdText = canisterId instanceof Principal ? canisterId.toText() : canisterId;

		const key = `${canisterIdText}${certified ? '+' : '#'}${identityText}`;

		if (isNullish(this.#actors) || isNullish(this.#actors[key])) {
			const actor = await this.createActor({ identity, canisterId, ...rest });

			this.#actors = {
				...(this.#actors ?? {}),
				[key]: actor
			};

			return actor;
		}

		return this.#actors[key];
	}

	private async createActor({
		canisterId,
		idlFactory,
		config = {},
		...rest
	}: CreateActorParams): Promise<ActorSubclass<T>> {
		const agent = await getAgent(rest);

		// Creates an actor with using the candid interface and the HttpAgent
		return Actor.createActor(idlFactory, {
			agent,
			canisterId,
			...config
		});
	}
}
