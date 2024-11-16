<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { buildSetAuthenticationConfig } from '$lib/utils/auth.config.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		config: AuthenticationConfig | undefined;
		domainNameInput: string;
	}

	let { config, domainNameInput }: Props = $props();

	let authDomain: string | undefined = $derived(
		fromNullable(fromNullable(config?.internet_identity ?? [])?.derivation_origin ?? [])
	);

	let edit: boolean = $derived(nonNullish(authDomain));

	const dispatch = createEventDispatcher();

	const yes = () => {
		const payload = buildSetAuthenticationConfig({ config, domainName: domainNameInput });

		dispatch('junoNext', payload);
	};

	const no = () => dispatch('junoNext', config);
</script>

<h2>{edit ? $i18n.hosting.update_auth_domain_title : $i18n.hosting.set_auth_domain_title}</h2>

<p>
	{#if edit}
		<Html
			text={i18nFormat($i18n.hosting.update_auth_domain_question, [
				{
					placeholder: '{0}',
					value: domainNameInput
				},
				{
					placeholder: '{1}',
					value: authDomain ?? ''
				}
			])}
		/>
	{:else}
		<Html
			text={i18nFormat($i18n.hosting.set_auth_domain_question, [
				{
					placeholder: '{0}',
					value: domainNameInput
				},
				{
					placeholder: '{1}',
					value: domainNameInput.startsWith('www')
						? domainNameInput.replace('www.', '')
						: `www.${domainNameInput}`
				},
				{
					placeholder: '{2}',
					value: domainNameInput
				}
			])}
		/>{/if}
</p>

<div class="toolbar">
	<button onclick={no}
		>{#if edit}
			<span
				><Html
					text={i18nFormat($i18n.hosting.no_keep_domain, [
						{
							placeholder: '{0}',
							value: authDomain ?? ''
						}
					])}
				/></span
			>
		{:else}{$i18n.core.no}{/if}</button
	>
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
