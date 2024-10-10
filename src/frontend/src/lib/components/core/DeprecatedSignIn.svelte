<script lang="ts">
	import { isBusy } from '$lib/stores/busy.store';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<p class="sign-in-now">
	Juno defaults to
	<button class="text action" on:click={() => dispatch('junoSignIn')} disabled={$isBusy}
		>internetcomputer.org</button
	> for authentication.
</p>

<p>
	Alternatively, use the legacy method at
	<button class="text action" on:click={() => dispatch('junoSignInDeprecated')} disabled={$isBusy}
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
