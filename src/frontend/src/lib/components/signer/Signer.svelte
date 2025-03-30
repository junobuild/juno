<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, type FadeParams } from 'svelte/transition';
	import SignerAccounts from '$lib/components/signer/SignerAccounts.svelte';
	import SignerIdle from '$lib/components/signer/SignerIdle.svelte';
	import SignerPermissions from '$lib/components/signer/SignerPermissions.svelte';
	import { SIGNER_CONTEXT_KEY, type SignerContext } from '$lib/stores/signer.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const { idle } = getContext<SignerContext>(SIGNER_CONTEXT_KEY);

	// We use specific fade parameters for the idle state due to the asynchronous communication between the relying party and the wallet.
	// Because the idle state might be displayed when a client starts communication with the wallet, we add a small delay to prevent a minor glitch where the idle animation is briefly shown before the actual action is rendered.
	// Technically, from a specification standpoint, we don't have a way to fully prevent this.
	const fadeParams: FadeParams = { delay: 150, duration: 250 };
</script>

<SignerAccounts {missionControlId}>
	{#if $idle}
		<div in:fade={fadeParams}>
			<SignerIdle />
		</div>
	{:else}
		<SignerPermissions {missionControlId} />
	{/if}
</SignerAccounts>
