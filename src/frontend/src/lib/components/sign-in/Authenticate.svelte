<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import ContainerCentered from '$lib/components/ui/ContainerCentered.svelte';
	import Message from '$lib/components/ui/Message.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { getAndClearAuthNavOrigin } from '$lib/services/auth/_auth.nav.services';
	import { handleRedirectCallback } from '$lib/services/auth/auth.openid.services';
	import { i18n } from '$lib/stores/i18n.store';

	let state = $state<'loading' | 'ok' | 'error'>('loading');

	const signIn = async () => {
		const { result } = await handleRedirectCallback();
		state = result;

		if (result !== 'ok') {
			return;
		}

		setTimeout(async () => {
			const redirectUrl = getAndClearAuthNavOrigin();
			await goto(redirectUrl, { replaceState: true });
		}, 1000);
	};

	onMount(signIn);
</script>

<ContainerCentered>
	{#if state === 'ok'}
		<Message>
			{#snippet icon()}
				<span>👋</span>
			{/snippet}

			<p>{$i18n.sign_in_openid.success}</p>
		</Message>
	{:else if state === 'error'}
		<Message>
			{#snippet icon()}
				<span>❌</span>
			{/snippet}

			<p>{$i18n.errors.sign_in_openid}</p>
		</Message>
	{:else}
		<div in:fade>
			<Message>
				{#snippet icon()}
					<Spinner inline />
				{/snippet}

				<p>{$i18n.sign_in_openid.in_progress}</p>
			</Message>
		</div>
	{/if}
</ContainerCentered>

<style lang="scss">
	span {
		font-size: var(--font-size-h1);
		line-height: 1;
	}
</style>
