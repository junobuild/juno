<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ContainerCentered from '$lib/components/ui/ContainerCentered.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { authenticate } from '$lib/services/auth/auth.openid.services';
	import { i18n } from '$lib/stores/i18n.store';

	let state = $state<'loading' | 'ok' | 'error'>('loading');

	const signIn = async () => {
		const { result } = await authenticate();
		state = result;
	};

	onMount(signIn);
</script>

<ContainerCentered>
	{#if state === 'ok'}
		<p>{$i18n.sign_in_openid.success}</p>
	{:else if state === 'error'}
		<p>❌ {$i18n.sign_in_openid.error}</p>
	{:else}
		<div class="spinner" in:fade>
			<Spinner inline />

			<p class="loading">{$i18n.sign_in_openid.in_progress}</p>
		</div>
	{/if}
</ContainerCentered>

<style lang="scss">
	.spinner {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--padding-2_5x);
	}
</style>
