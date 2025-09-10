<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteUi } from '$lib/types/satellite';

	interface Props {
		satellite: SatelliteUi;
	}

	let { satellite }: Props = $props();

	let env = $derived(satellite.metadata.environment);

	let color = $derived<'primary' | 'secondary' | 'tertiary'>(
		env === 'test' ? 'tertiary' : env === 'staging' ? 'secondary' : 'primary'
	);
</script>

{#if nonNullish(env)}
	<Badge {color}>
		<span class="visually-hidden">{$i18n.satellites.environment}:</span>
		<span>{env}</span>
	</Badge>
{/if}

<style lang="scss">
	@use '../../styles/mixins/a11y';

	.visually-hidden {
		@include a11y.visually-hidden;
	}
</style>
