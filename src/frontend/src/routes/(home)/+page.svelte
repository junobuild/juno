<script lang="ts">
	import { fade } from 'svelte/transition';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';
	import Loaders from '$lib/components/loaders/Loaders.svelte';
	import SignIn from '$lib/components/sign-in/SignIn.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
</script>

{#if $authSignedIn}
	<div in:fade>
		<Loaders>
			<Launchpad />
		</Loaders>
	</div>
{:else}
	<SignIn />
{/if}
