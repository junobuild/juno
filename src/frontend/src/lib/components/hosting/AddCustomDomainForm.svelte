<script lang="ts">
	import { isEmptyString, isNullish } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import AddCustomDomainAuth, {
		type AddCustomDomainAuthProps
	} from '$lib/components/hosting/AddCustomDomainAuth.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';

	interface Props extends AddCustomDomainAuthProps {
		satellite: Satellite;
		domainNameInput: string;
		dns?: CustomDomainDns | undefined;
		onnext: () => void;
	}

	let {
		satellite,
		domainNameInput = $bindable(),
		dns = $bindable(undefined),
		config,
		useDomainForDerivationOrigin = $bindable(false),
		onnext
	}: Props = $props();

	const onSubmitDomainName = ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish(domainNameInput) || isEmptyString(domainNameInput)) {
			toasts.error({
				text: $i18n.errors.hosting_missing_domain_name
			});
			return;
		}

		try {
			dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_invalid_url,
				detail: err
			});
			return;
		}

		onnext();
	};
</script>

<h2>{$i18n.hosting.add_custom_domain}</h2>

<p>
	{$i18n.hosting.description}
</p>

<form onsubmit={onSubmitDomainName}>
	<input
		name="domain_name"
		autocomplete="off"
		data-1p-ignore
		placeholder={$i18n.hosting.domain_name}
		type="text"
		bind:value={domainNameInput}
	/>

	<AddCustomDomainAuth {config} bind:useDomainForDerivationOrigin />

	<button type="submit">{$i18n.core.continue}</button>
</form>
