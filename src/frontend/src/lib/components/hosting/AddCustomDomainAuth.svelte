<script lang="ts">
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { buildSetAuthenticationConfig } from '$lib/utils/auth.config.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		config: AuthenticationConfig | undefined;
		domainNameInput: string;
		next: (config: AuthenticationConfig | null) => void;
	}

	let { config, domainNameInput, next }: Props = $props();

	const yes = () => {
		const payload = buildSetAuthenticationConfig({ config, domainName: domainNameInput });

		next(payload);
	};

	const no = () => next(null);
</script>

<h2>{$i18n.hosting.set_auth_domain_title}</h2>

<p>
	<Html
		text={i18nFormat($i18n.hosting.set_auth_domain_question, [
			{
				placeholder: '{0}',
				value: domainNameInput
			}
		])}
	/>
</p>

<p>
	{$i18n.hosting.need_more_info}
	<ExternalLink
		underline
		href="https://juno.build/docs/build/authentication/#domain-based-user-identity"
		>documentation</ExternalLink
	>.
</p>

<div class="toolbar">
	<button onclick={no}>{$i18n.core.no}</button>
	<button onclick={yes}>{$i18n.core.yes}</button>
</div>

<style lang="scss">
	@use '../../styles/mixins/text';

	button {
		max-width: 100%;

		span {
			@include text.truncate;
		}
	}
</style>
