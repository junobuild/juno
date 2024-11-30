<script lang="ts">
	import { fade } from 'svelte/transition';
	import SignIn from '$lib/components/core/SignIn.svelte';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
</script>

{#if $authSignedInStore}
	<div in:fade>
		<Launchpad />
	</div>
{:else}
	<SignIn />
{/if}
