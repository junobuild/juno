<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isNullish, notEmptyString } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { createEventDispatcher } from 'svelte';

	export let satellite: Satellite;
	export let domainNameInput: string;
	export let dns: CustomDomainDns | undefined = undefined;

	const dispatch = createEventDispatcher();

	const onSubmitDomainName = () => {
		if (isNullish(domainNameInput) || !notEmptyString(domainNameInput)) {
			toasts.error({
				text: $i18n.errors.hosting_missing_domain_name
			});
			return;
		}

		try {
			dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_invalid_url
			});
			return;
		}

		dispatch('junoNext');
	};
</script>

<h2>{$i18n.hosting.add_custom_domain}</h2>

<p>
	{$i18n.hosting.description}
</p>

<form on:submit|preventDefault={onSubmitDomainName}>
	<input
		bind:value={domainNameInput}
		type="text"
		name="domain_name"
		placeholder={$i18n.hosting.domain_name}
	/>

	<button type="submit">{$i18n.core.continue}</button>
</form>
