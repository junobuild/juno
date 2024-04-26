<script lang="ts">
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { createEventDispatcher } from 'svelte';

	export let config: AuthenticationConfig | undefined;
	export let domainNameInput: string;

	let authDomain: string | undefined;
	$: authDomain = fromNullable(
		fromNullable(config?.internet_identity ?? [])?.authentication_domain ?? []
	);

	let edit: boolean;
	$: edit = nonNullish(authDomain);

	const dispatch = createEventDispatcher();

	const yes = () => {
		const payload: AuthenticationConfig = isNullish(config)
				? {
					internet_identity: [{
						authentication_domain: [domainNameInput]
					}]
				}
				: {
					...config,
					...(nonNullish(fromNullable(config.internet_identity)) && {
						internet_identity: [
							{ ...fromNullable(config.internet_identity), authentication_domain: [domainNameInput] }
						]
					})
				};

		dispatch('junoNext', payload);
	};

	const no = () => {
		const payload: AuthenticationConfig | undefined = isNullish(config)
			? undefined
			: {
					...config,
					...(nonNullish(fromNullable(config.internet_identity)) && {
						internet_identity: [
							{ ...fromNullable(config.internet_identity), authentication_domain: [] }
						]
					})
				};

		dispatch('junoNext', payload);
	};
</script>

<h2>{edit ? $i18n.hosting.update_auth_domain_title : $i18n.hosting.set_auth_domain_title}</h2>

<p>
	{#if edit}
		{@html i18nFormat($i18n.hosting.update_auth_domain_question, [
			{
				placeholder: '{0}',
				value: domainNameInput
			},
			{
				placeholder: '{1}',
				value: authDomain ?? ''
			}
		])}
	{:else}{/if}

	{@html i18nFormat($i18n.hosting.set_auth_domain_question, [
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
</p>

<div class="toolbar">
	<button on:click={no}>{$i18n.core.no}</button>
	<button on:click={yes}>{$i18n.core.yes}</button>
</div>
