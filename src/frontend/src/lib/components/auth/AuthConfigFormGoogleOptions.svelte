<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import {
		fromNullable,
		fromNullishNullable,
		isEmptyString,
		nonNullish,
		notEmptyString
	} from '@dfinity/utils';
	import { PrincipalTextSchema } from '@dfinity/zod-schemas';
	import { onMount } from 'svelte';
	import type { MissionControlDid, SatelliteDid } from '$declarations';
	import type { OpenIdProviderDelegationConfig } from '$declarations/satellite/satellite.did';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		delegation: SatelliteDid.OpenIdProviderDelegationConfig | undefined;
		allowedTargets: Principal[];
	}

	let { delegation, allowedTargets = $bindable([]) }: Props = $props();

	let allowedTargetsInput = $state<string>(
		(fromNullable(delegation?.targets ?? []) ?? []).map((target) => target.toText()).join('\n')
	);

	$effect(() => {
		allowedTargets = allowedTargetsInput
			.split(/[\n,]+/)
			.map((input) => input.toLowerCase().trim())
			.filter(notEmptyString)
			.filter((input) => PrincipalTextSchema.safeParse(input).success)
			.map((input) => Principal.fromText(input));
	});

	let collapsibleRef: Collapsible | undefined = $state(undefined);

	onMount(() => {
		if (isEmptyString(allowedTargetsInput)) {
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
				{$i18n.authentication.allowed_targets}
			{/snippet}

			<textarea
				placeholder={$i18n.authentication.allowed_targets_placeholder}
				rows="5"
				bind:value={allowedTargetsInput}
			></textarea>
		</Value>
	</div>
</Collapsible>
