<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import { satelliteEnvironment } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let env = $derived(satelliteEnvironment(satellite));
</script>

{#if nonNullish(env)}
	<Value>
		{#snippet label()}
			{$i18n.satellites.environment}
		{/snippet}

		<p>{env}</p>
	</Value>
{/if}

<style lang="scss">
	p {
		&::first-letter {
			text-transform: uppercase;
		}
	}
</style>
