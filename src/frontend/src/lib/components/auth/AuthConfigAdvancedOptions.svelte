<script lang="ts">
	import { fromNullable, fromNullishNullable, isEmptyString } from '@dfinity/utils';
	import { onMount, type SvelteComponent } from 'svelte';
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		config: AuthenticationConfig | undefined;
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

	let collapsibleRef: (SvelteComponent & { open: () => void; close: () => void }) | undefined =
		$state(undefined);

	onMount(() => {
		if (isEmptyString(externalAlternativeOriginsInput)) {
			return;
		}

		collapsibleRef?.open();
	});
</script>

<Collapsible bind:this={collapsibleRef}>
	<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

	<div>
		<Value>
			{#snippet label()}
				{$i18n.authentication.external_alternative_origins}
			{/snippet}

			<Input
				inputType="text"
				name="destination"
				required={false}
				placeholder={$i18n.authentication.external_alternative_origins_placeholder}
				bind:value={externalAlternativeOriginsInput}
			/>
		</Value>
	</div>
</Collapsible>
