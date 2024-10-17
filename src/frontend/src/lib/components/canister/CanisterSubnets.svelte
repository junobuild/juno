<script lang="ts">
	import subnets from '$lib/env/subnets.json';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { PrincipalText } from '$lib/types/itentity';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';
	import { DEV, JUNO_SUBNET_ID } from '$lib/constants/constants';
	import { getDefaultSubnets } from '$lib/api/cmc.api';
	import type {Subnet} from "$lib/types/subnet";

	export let subnetId: PrincipalText | undefined;

	let filteredSubnets: Subnet[];
	$: filteredSubnets = subnets.filter(({ subnetId }) => subnetId !== JUNO_SUBNET_ID);

	let extendedSubnets: Subnet[] = [];

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

	$: filteredSubnets, (async () => extendSubnets())();
</script>

<div class="subnet">
	<Value>
		<svelte:fragment slot="label">{$i18n.canisters.subnet}</svelte:fragment>
		<select name="subnet" bind:value={subnetId}>
			<option value={undefined}>{$i18n.canisters.default_subnet}</option>

			{#each extendedSubnets as { subnetId }}
				<option value={subnetId}>{shortenWithMiddleEllipsis(subnetId)}</option>
			{/each}
		</select>
	</Value>
</div>
