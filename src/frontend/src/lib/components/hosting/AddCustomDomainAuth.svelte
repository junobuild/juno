<script module lang="ts">
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';

	export interface AddCustomDomainAuthProps {
		config: AuthenticationConfig | undefined;
		useDomainForDerivationOrigin: boolean;
	}
</script>

<script lang="ts">
	import { fromNullishNullable, isEmptyString } from '@dfinity/utils';
	import CheckboxInline from '$lib/components/ui/CheckboxInline.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	let { config, useDomainForDerivationOrigin = $bindable(false) }: AddCustomDomainAuthProps =
		$props();

	let existingDerivationOrigin = $derived(
		fromNullishNullable(fromNullishNullable(config?.internet_identity)?.derivation_origin)
	);

	let noExistingDerivationOrigin = $derived(isEmptyString(existingDerivationOrigin));
</script>

{#if noExistingDerivationOrigin}
	<Collapsible>
		{#snippet header()}
			{$i18n.core.advanced_options}
		{/snippet}

		<CheckboxInline bind:checked={useDomainForDerivationOrigin}>
			{$i18n.hosting.set_auth_domain_question}
		</CheckboxInline>
	</Collapsible>
{/if}
