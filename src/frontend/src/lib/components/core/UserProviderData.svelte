<script lang="ts">
	import { fromNullable, notEmptyString } from '@dfinity/utils';
	import type { ConsoleDid } from '$declarations';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		provider: ConsoleDid.Provider;
	}

	let { provider }: Props = $props();

	let openId = $derived<ConsoleDid.OpenId | undefined>(
		'OpenId' in provider ? provider.OpenId : undefined
	);
	let openIdData = $derived<ConsoleDid.OpenIdData | undefined>(openId?.data);
	let openIdPicture = $derived<string | undefined>(fromNullable(openIdData?.picture ?? []));
	let openIdGivenName = $derived<string | undefined>(fromNullable(openIdData?.given_name ?? []));
	let openIdEmail = $derived<string | undefined>("david.demo@gmail.com");
</script>

{#if notEmptyString(openIdGivenName) || notEmptyString(openIdEmail)}
	<div class="container">
		{#if notEmptyString(openIdPicture)}
			<picture><img alt={$i18n.sign_in_openid.avatar} src={openIdPicture} /></picture>
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

	picture {
		display: block;

		width: 32px;
		height: 32px;
		min-width: 32px;

		border-radius: 50%;
		overflow: hidden;
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
