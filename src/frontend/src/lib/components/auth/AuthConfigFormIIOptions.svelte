<script lang="ts">
	import { fromNullable, fromNullishNullable, isEmptyString } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { SatelliteDid } from '$declarations';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		config: SatelliteDid.AuthenticationConfig | undefined;
		externalAlternativeOrigins: string;
	}

	let { config, externalAlternativeOrigins = $bindable('') }: Props = $props();

	let externalAlternativeOriginsInput = $state(
		(
			fromNullable(
				fromNullishNullable(config?.internet_identity)?.external_alternative_origins ?? []
			) ?? []
		).join(',')
	);

	$effect(() => {
		externalAlternativeOrigins = externalAlternativeOriginsInput;
	});

	let collapsibleRef: Collapsible | undefined = $state(undefined);

	onMount(() => {
		if (isEmptyString(externalAlternativeOriginsInput)) {
			return;
		}

		collapsibleRef?.open();
	});
</script>

<Collapsible bind:this={collapsibleRef}>
	{#snippet header()}
		{$i18n.core.advanced_options}
	{/snippet}

	<div>
		<Value>
			{#snippet label()}
				{$i18n.authentication.external_alternative_origins}
			{/snippet}

			<Input
				name="destination"
				inputType="text"
				placeholder={$i18n.authentication.external_alternative_origins_placeholder}
				required={false}
				bind:value={externalAlternativeOriginsInput}
			/>
		</Value>
	</div>
</Collapsible>
