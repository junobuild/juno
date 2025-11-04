<script lang="ts">
	import { fromNullable, nonNullish, notEmptyString } from '@dfinity/utils';
	import { type PrincipalText, PrincipalTextSchema } from '@dfinity/zod-schemas';
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import type { MissionControlDid, SatelliteDid } from '$declarations';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
		delegation: SatelliteDid.OpenIdProviderDelegationConfig | undefined;
		allowedTargets: PrincipalText[] | null | undefined;
	}

	let {
		satellite,
		delegation,
		allowedTargets = $bindable<PrincipalText[] | null | undefined>(undefined)
	}: Props = $props();

	let targets = $state(
		// delegation.targets===[] (exactly equals because delegation is undefined by default)
		nonNullish(delegation) && nonNullish(delegation.targets) && delegation.targets.length === 0
			? null
			: // delegation.targets===[[]]
				(fromNullable(delegation?.targets ?? []) ?? []).length === 0
				? undefined
				: (fromNullable(delegation?.targets ?? []) ?? []).map((p) => p.toText())
	);

	let allowedTargetsInput = $state<string>((targets ?? []).map((target) => target).join('\n'));

	let targetsType = $state<'default' | 'none' | 'custom'>(
		targets === null ? 'none' : targets === undefined ? 'default' : 'custom'
	);

	const setTargets = (targetsInput: string) => {
		allowedTargets = targetsInput
			.split(/[\n,]+/)
			.map((input) => input.toLowerCase().trim())
			.filter(notEmptyString)
			.filter((input) => PrincipalTextSchema.safeParse(input).success);
	};

	$effect(() => {
		switch (targetsType) {
			case 'default':
				allowedTargets = undefined;
				break;
			case 'none':
				allowedTargets = null;
				break;
			case 'custom':
				setTargets(allowedTargetsInput);
				setTimeout(() => collapsibleRef?.updateMaxHeight(), 250);
				break;
		}
	});

	$effect(() => {
		setTargets(allowedTargetsInput);
	});

	let collapsibleRef: Collapsible | undefined = $state(undefined);

	onMount(() => {
		if (targetsType === 'default') {
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

			<div>
				<select bind:value={targetsType}>
					<option value="default">
						{$i18n.authentication.target_your_satellite} {satelliteName(satellite)}</option
					>
					<option value="none"> {$i18n.authentication.no_restrictions} </option>
					<option value="custom"> {$i18n.core.custom} </option>
				</select>
			</div>

			{#if targetsType === 'custom'}
				<div in:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}>
					<textarea
						placeholder={$i18n.authentication.allowed_targets_placeholder}
						rows="5"
						bind:value={allowedTargetsInput}
					></textarea>
				</div>
			{/if}
		</Value>
	</div>
</Collapsible>
