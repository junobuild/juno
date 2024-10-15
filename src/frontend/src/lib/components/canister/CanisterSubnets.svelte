<script lang="ts">
	import subnets from '$lib/env/subnets.json';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { PrincipalText } from '$lib/types/itentity';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';
	import { JUNO_SUBNET_ID } from '$lib/constants/constants';

	export let subnetId: PrincipalText | undefined;

	let filteredSubnets: PrincipalText[];
	$: filteredSubnets = subnets; // TODO: uncomment.filter(({ subnetId }) => subnetId !== JUNO_SUBNET_ID);
</script>

<div class="subnet">
	<Value>
		<svelte:fragment slot="label">{$i18n.canisters.subnet}</svelte:fragment>
		<select name="subnet" bind:value={subnetId}>
			<option value={undefined}>{$i18n.canisters.default_subnet}</option>

			{#each filteredSubnets as { subnetId }}
				<option value={subnetId}>{shortenWithMiddleEllipsis(subnetId)}</option>
			{/each}
		</select>
	</Value>
</div>
