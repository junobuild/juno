<script lang="ts">
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import CanisterSubnets from '$lib/components/canister/CanisterSubnets.svelte';
</script>

<Collapsible>
	<svelte:fragment slot="header">{$i18n.canisters.advanced_options}</svelte:fragment>

	<CanisterSubnets />
</Collapsible>
