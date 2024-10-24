<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { signIn } from '$lib/services/auth.services';
	import { isBusy } from '$lib/stores/busy.store';

	const dispatch = createEventDispatcher();

	const doSignIn = async (domain: 'internetcomputer.org' | 'ic0.app') => {
		dispatch('junoSignIn');
		await signIn({ domain });
	};
</script>

<p class="sign-in-now">
	Juno defaults to
	<button
		class="text action"
		onclick={async () => await doSignIn('internetcomputer.org')}
		disabled={$isBusy}>internetcomputer.org</button
	> for authentication.
</p>

<p>
	Alternatively, use the legacy method at
	<button class="text action" onclick={async () => await doSignIn('ic0.app')} disabled={$isBusy}
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
