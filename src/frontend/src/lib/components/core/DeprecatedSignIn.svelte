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
	Juno uses
	<button
		class="text action"
		on:click={async () => await doSignIn('internetcomputer.org')}
		disabled={$isBusy}>internetcomputer.org</button
	> by default.
</p>

<p>
	You can also sign-in for now with deprecated method
	<button class="text action" on:click={async () => await doSignIn('ic0.app')} disabled={$isBusy}
		>ic0.app</button
	>.
</p>

<style lang="scss">
	.sign-in-now {
		margin: var(--padding-12x) 0 0;
	}

	.action {
		margin: 0;
	}

	p {
		font-size: var(--font-size-ultra-small);
		margin: 0;
		padding: 0 0 var(--padding-0_25x);
	}
</style>
