<script lang="ts">
	import Value from '$lib/components/ui/Value.svelte';
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
	import { fromNullable, nonNullish } from '@dfinity/utils';

	let orbiterMonitored = $derived(
		fromNullable(
			fromNullable(fromNullable($orbiterStore?.settings ?? [])?.monitoring ?? [])?.cycles ?? []
		)?.enabled === true
	);
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
