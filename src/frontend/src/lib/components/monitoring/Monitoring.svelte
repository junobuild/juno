<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import type { Monitoring } from '$declarations/mission_control/mission_control.did';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		monitoring: Monitoring | undefined;
		loading: boolean;
	}

	let { monitoring, loading }: Props = $props();

	let cycles = $derived(fromNullable(monitoring?.cycles ?? []));

	let enabled = $derived(cycles?.enabled === true);
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.monitoring.title}
		{/snippet}

		{#if loading}
			<SkeletonText />
		{:else if enabled}
			{$i18n.core.enabled}
		{:else}
			{$i18n.core.disabled}
		{/if}
	</Value>
</div>
