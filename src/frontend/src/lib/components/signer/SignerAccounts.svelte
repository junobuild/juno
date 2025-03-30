<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import { SIGNER_CONTEXT_KEY, type SignerContext } from '$lib/stores/signer.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		missionControlId: MissionControlId;
		children: Snippet;
	}

	let { missionControlId, children }: Props = $props();

	const {
		accountsPrompt: { payload, reset: resetPrompt }
	} = getContext<SignerContext>(SIGNER_CONTEXT_KEY);

	const onAccountsPrompt = () => {
		if (isNullish($payload)) {
			// Payload has been reset. Nothing to do.
			return;
		}

		const { approve } = $payload;

		approve([
			...(nonNullish($authStore.identity) ? [{ owner: $authStore.identity.getPrincipal().toText() }] : []),
			{ owner: missionControlId.toText() }
		]);

		resetPrompt();
	};

	$effect(() => {
		$payload;

		onAccountsPrompt();
	});
</script>

{@render children()}
