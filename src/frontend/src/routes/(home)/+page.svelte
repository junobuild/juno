<script lang="ts">
	import { fade } from 'svelte/transition';
	import Loaders from '$lib/components/app/loaders/Loaders.svelte';
	import SignIn from '$lib/components/auth/sign-in/SignIn.svelte';
	import Launchpad from '$lib/components/modules/launchpad/Launchpad.svelte';
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
