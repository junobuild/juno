<script lang="ts">
	import CanisterSubnets from '$lib/components/canister/CanisterSubnets.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { PrincipalText } from '$lib/types/itentity';

	export let subnetId: PrincipalText | undefined;
</script>

<Collapsible>
	<svelte:fragment slot="header">{$i18n.canisters.advanced_options}</svelte:fragment>

	<CanisterSubnets bind:subnetId />
</Collapsible>
