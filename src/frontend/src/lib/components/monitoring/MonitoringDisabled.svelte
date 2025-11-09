<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { MissionControlDid } from '$declarations';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		monitoring: MissionControlDid.Monitoring | undefined;
		loading: boolean;
	}

	let { monitoring, loading }: Props = $props();

	let cycles = $derived(fromNullishNullable(monitoring?.cycles));

	let enabled = $derived(cycles?.enabled === true);
</script>

{#if !enabled && !loading}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.monitoring.auto_refill}
			{/snippet}

			{$i18n.core.disabled}
		</Value>
	</div>
{/if}
