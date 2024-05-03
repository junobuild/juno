<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import SignIn from '$lib/components/core/SignIn.svelte';
	import { fade } from 'svelte/transition';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';
</script>

{#if $authSignedInStore}
	<div in:fade>
		<Launchpad />
	</div>
{:else}
	<SignIn />
{/if}
