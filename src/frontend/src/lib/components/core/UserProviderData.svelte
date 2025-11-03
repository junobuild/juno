<script lang="ts">
	import { fromNullable, nonNullish, notEmptyString } from '@dfinity/utils';
	import type { ConsoleDid } from '$declarations';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		provider?: ConsoleDid.Provider;
	}

	let { provider }: Props = $props();

	let openId = $derived<ConsoleDid.OpenId | undefined>(
		nonNullish(provider) && 'OpenId' in provider ? provider.OpenId : undefined
	);
	let openIdData = $derived<ConsoleDid.OpenIdData | undefined>(openId?.data);
	let openIdPicture = $derived<string | undefined>(fromNullable(openIdData?.picture ?? []));
	let openIdGivenName = $derived<string | undefined>(fromNullable(openIdData?.given_name ?? []));
	let openIdEmail = $derived<string | undefined>(fromNullable(openIdData?.email ?? []));
</script>

{#if notEmptyString(openIdGivenName) || notEmptyString(openIdEmail)}
	<div class="container">
		{#if notEmptyString(openIdPicture)}
			<Avatar alt={$i18n.sign_in_openid.avatar} size="32px" src={openIdPicture} />
		{/if}

		<div class="meta">
			{#if notEmptyString(openIdGivenName)}
				<span class="name">{openIdGivenName}</span>
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
