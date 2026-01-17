<script lang="ts">
	import { onMount } from 'svelte';
	import AlreadySignedIn from '$lib/components/sign-in/AlreadySignedIn.svelte';
	import Authenticate from '$lib/components/sign-in/Authenticate.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';

	let alreadySignIn = $state<boolean | undefined>(undefined);

	onMount(async () => {
		alreadySignIn = $authSignedIn;

		const {
			location: { search }
		} = window;
		const urlParams = new URLSearchParams(search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');

		console.log('-------REDIRECT---------->', code, state);

		const result = await fetch('http://localhost:3000/v1/auth/callback/github', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code, state })
		}).then((r) => r.json());

		console.log('-----RESULT--------->', result);
	});
</script>

{#if alreadySignIn === true}
	<AlreadySignedIn />
{:else if alreadySignIn === false}
	TODO: Hello World
{/if}
