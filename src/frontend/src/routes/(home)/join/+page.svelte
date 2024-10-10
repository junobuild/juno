<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { fade } from 'svelte/transition';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';
	import SignInRedeem from '$lib/components/core/SignInRedeem.svelte';

	export let data: {
		invite: string | null | undefined;
	};

	let invite: string;
	$: invite = data?.invite ?? '';
</script>

{#if $authSignedInStore}
	<div in:fade>
		<Launchpad />
	</div>
{:else}
	<SignInRedeem invitationCode={invite} />
{/if}
