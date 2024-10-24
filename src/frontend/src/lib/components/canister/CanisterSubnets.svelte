<script lang="ts">
	import { run } from 'svelte/legacy';

	import { getDefaultSubnets } from '$lib/api/cmc.api';
	import Value from '$lib/components/ui/Value.svelte';
	import { DEV, JUNO_SUBNET_ID } from '$lib/constants/constants';
	import subnets from '$lib/env/subnets.json';
	import { i18n } from '$lib/stores/i18n.store';
	import type { PrincipalText } from '$lib/types/itentity';
	import type { Subnet } from '$lib/types/subnet';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';

	interface Props {
		subnetId: PrincipalText | undefined;
	}

	let { subnetId = $bindable() }: Props = $props();

	let filteredSubnets: Subnet[] = $state();
	run(() => {
		filteredSubnets = subnets.filter(({ subnetId }) => subnetId !== JUNO_SUBNET_ID);
	});

	let extendedSubnets: Subnet[] = $state([]);

	const extendSubnets = async () => {
		if (!DEV) {
			extendedSubnets = subnets;
			return;
		}

		// The local docker image supports only a single subnet which is not a mainnet ID.
		// So we add it at the top and we still display the other subnets that way we can assert visually it looks ok while still being able to use the facture on one specific subnet.
		const localSubnets = await getDefaultSubnets();

		extendedSubnets = [
			...localSubnets.map((subnet) => ({ subnetId: subnet.toText() })),
			...subnets
		];
	};

	run(() => {
		filteredSubnets, (async () => await extendSubnets())();
	});
</script>

<div class="subnet">
	<Value>
		{#snippet label()}
			{$i18n.canisters.subnet}
		{/snippet}
		<select name="subnet" bind:value={subnetId}>
			<option value={undefined}>{$i18n.canisters.default_subnet}</option>

			{#each extendedSubnets as { subnetId }}
				<option value={subnetId}>{shortenWithMiddleEllipsis(subnetId)}</option>
			{/each}
		</select>
	</Value>
</div>
