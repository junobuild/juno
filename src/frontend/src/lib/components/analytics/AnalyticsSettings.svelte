<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import AnalyticsControllers from '$lib/components/analytics/AnalyticsControllers.svelte';
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		orbiterId: Principal;
	}

	let { orbiterId }: Props = $props();
</script>

<div>
	<CanisterSettings
		canisterId={orbiterId}
		segment="orbiter"
		segmentLabel={$i18n.analytics.orbiter}
	/>
</div>

<AnalyticsControllers {orbiterId} />

<style lang="scss">
	div {
		margin: var(--padding-8x) 0 0;
	}
</style>
