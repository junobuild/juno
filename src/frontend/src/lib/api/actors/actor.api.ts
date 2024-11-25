import { getAgent, type GetAgentParams } from '$lib/api/agent/agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import { Actor, type ActorConfig, type ActorMethod, type ActorSubclass } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish } from '@dfinity/utils';

type GetActorParams = {
	canisterId: string | Principal;
	idlFactory: IDL.InterfaceFactory;
	config?: Pick<ActorConfig, 'callTransform' | 'queryTransform'>;
} & GetAgentParams;

export class ActorApi<T = Record<string, ActorMethod>> {
	#actors: Option<Record<string, ActorSubclass<T>>> = undefined;

	async getActor({
		identity,
		canisterId,
		...rest
	}: Omit<GetActorParams, 'identity'> & { identity: OptionIdentity }): Promise<ActorSubclass<T>> {
		assertNonNullish(identity, 'No internet identity to initialize the actor.');

		const identityText = identity.getPrincipal().toText();
		const canisterIdText = canisterId instanceof Principal ? canisterId.toText() : canisterId;

		const key = `${canisterIdText}#${identityText}`;

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
	}: GetActorParams): Promise<ActorSubclass<T>> {
		const agent = await getAgent(rest);

		// Creates an actor with using the candid interface and the HttpAgent
		return Actor.createActor(idlFactory, {
			agent,
			canisterId,
			...config
		});
	}
}
