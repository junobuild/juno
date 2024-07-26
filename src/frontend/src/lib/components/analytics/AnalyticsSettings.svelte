<script lang="ts">
	import AnalyticsControllers from '$lib/components/analytics/AnalyticsControllers.svelte';
	import type { Principal } from '@dfinity/principal';
	import CanisterParameters from '$lib/components/canister/CanisterParameters.svelte';

	export let orbiterId: Principal;
</script>

<div>
	<CanisterParameters canisterId={orbiterId} segment="orbiter" />
</div>

<AnalyticsControllers {orbiterId} />

<style lang="scss">
	div {
		margin: var(--padding-8x) 0 0;
	}
</style>
