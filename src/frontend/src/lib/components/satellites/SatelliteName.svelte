<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satName = $derived(satelliteName(satellite));
</script>

<Value>
	{#snippet label()}
		{$i18n.satellites.name}
	{/snippet}

	<p>{satName}</p>
</Value>
