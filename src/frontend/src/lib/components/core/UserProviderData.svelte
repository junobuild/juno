<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { ProviderDataUi } from '$lib/types/provider';

	interface Props {
		providerData?: ProviderDataUi;
	}

	let { providerData }: Props = $props();

	let openIdPicture = $derived(providerData?.picture);
	let openIdGivenName = $derived(providerData?.givenName);
	let openIdPreferredUsername = $derived(providerData?.username);
	let openIdEmail = $derived(providerData?.email);

	let displayName = $derived(openIdPreferredUsername ?? openIdGivenName);
</script>

{#if notEmptyString(displayName) || notEmptyString(openIdEmail)}
	<div class="container">
		{#if notEmptyString(openIdPicture)}
			<Avatar alt={$i18n.sign_in_openid.avatar} size="32px" src={openIdPicture} />
		{/if}

		<div class="meta">
			{#if notEmptyString(displayName)}
				<span class="name">{displayName}</span>
			{/if}

			{#if notEmptyString(openIdEmail)}
				<span>{openIdEmail}</span>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/text';

	.container {
		display: flex;
		align-items: center;
		gap: var(--padding);

		padding: var(--padding) var(--padding);
	}

	.name {
		font-weight: bold;
	}

	.meta {
		display: flex;
		flex-direction: column;

		overflow: hidden;
	}

	span {
		@include text.truncate;
	}
</style>
