<script lang="ts">
	import AnalyticsControllers from '$lib/components/analytics/AnalyticsControllers.svelte';
	import type { Principal } from '@dfinity/principal';
	import CanisterSettings from '$lib/components/canister/CanisterSettings.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let orbiterId: Principal;
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
