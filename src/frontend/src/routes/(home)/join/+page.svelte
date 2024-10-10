<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { fade } from 'svelte/transition';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';
	import SignInRedeem from '$lib/components/core/SignInRedeem.svelte';
</script>

{#if $authSignedInStore}
	<div in:fade>
		<Launchpad />
	</div>
{:else}
	<SignInRedeem />
{/if}
