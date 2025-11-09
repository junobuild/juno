<script lang="ts">
	import { onMount } from 'svelte';
	import AlreadySignedIn from '$lib/components/sign-in/AlreadySignedIn.svelte';
	import Authenticate from '$lib/components/sign-in/Authenticate.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';

	let alreadySignIn = $state<boolean | undefined>(undefined);

	onMount(() => {
		alreadySignIn = $authSignedIn;
	});
</script>

{#if alreadySignIn === true}
	<AlreadySignedIn />
{:else if alreadySignIn === false}
	<Authenticate />
{/if}
