<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { satelliteEnvironment } from '$lib/utils/satellite.utils';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let env = $derived(satelliteEnvironment(satellite));

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
