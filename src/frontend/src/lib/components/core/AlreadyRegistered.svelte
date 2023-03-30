<script lang="ts">
	import { signIn } from '$lib/services/auth.services';
	import { isBusy } from '$lib/stores/busy.store';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const doSignIn = async (domain: 'internetcomputer.org' | 'ic0.app') => {
		dispatch('junoSignIn');
		await signIn({ domain });
	};
</script>

<p class="sign-in-now">
	<slot />Sign-in now on
	<button
		class="text action"
		on:click={async () => await doSignIn('internetcomputer.org')}
		disabled={$isBusy}>internetcomputer.org</button
	>
	(or
	<button class="text action" on:click={async () => await doSignIn('ic0.app')} disabled={$isBusy}
		>ic0.app</button
	>).
</p>

<style lang="scss">
	.sign-in-now {
		margin: 0;
	}

	.action {
		margin: 0;
	}
</style>
