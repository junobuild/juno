<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import { orbiterLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		orbiterMonitored: boolean;
	}

	let { orbiterMonitored = $bindable(false) }: Props = $props();

	$effect(() => {
		orbiterMonitored =
			fromNullable(
				fromNullable(fromNullable($orbiterStore?.settings ?? [])?.monitoring ?? [])?.cycles ?? []
			)?.enabled === true;
	});
</script>

{#if $orbiterLoaded && nonNullish($orbiterStore)}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.analytics.orbiter}
			{/snippet}

			<p>
				{orbiterMonitored ? $i18n.monitoring.monitored : $i18n.monitoring.not_monitored}
			</p>
		</Value>
	</div>
{/if}
