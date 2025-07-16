<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import { run } from 'svelte/legacy';
	import { getDefaultSubnets } from '$lib/api/cmc.api';
	import Value from '$lib/components/ui/Value.svelte';
	import { JUNO_SUBNET_ID } from '$lib/constants/app.constants';
	import { isProd, isSkylab } from '$lib/env/app.env';
	import subnets from '$lib/env/subnets.json';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Subnet } from '$lib/types/subnet';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';

	interface Props {
		subnetId: PrincipalText | undefined;
	}

	let { subnetId = $bindable() }: Props = $props();

	let filteredSubnets: Subnet[] = $derived(
		subnets.filter(({ subnetId }) => subnetId !== JUNO_SUBNET_ID)
	);

	let extendedSubnets: Subnet[] = $state([]);
	let sortedSubnets: Subnet[] = $derived(
		// eslint-disable-next-line local-rules/prefer-object-params
		extendedSubnets.toSorted(({ specialization: a }, { specialization: b }) =>
			(b ?? '').localeCompare(a ?? '')
		)
	);

	const extendSubnets = async () => {
		if (isProd()) {
			extendedSubnets = subnets;
			return;
		}

		// The local docker image supports only a single subnet which is not a mainnet ID.
		const localSubnets = await getDefaultSubnets();

		// For skylab we display only the local subnets as those are the one available
		if (isSkylab()) {
			extendedSubnets = [
				...localSubnets.map((subnet) => ({ subnetId: subnet.toText(), specialization: 'local' }))
			];
			return;
		}

		// For local development, we add it at the top and we still display the other subnets that way we can assert visually it looks ok while still being able to use the facture on one specific subnet.
		extendedSubnets = [
			...localSubnets.map((subnet) => ({ subnetId: subnet.toText(), specialization: 'local' })),
			...subnets
		];
	};

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		(filteredSubnets, (async () => await extendSubnets())());
	});
</script>

<div class="subnet">
	<Value>
		{#snippet label()}
			{$i18n.canisters.subnet}
		{/snippet}
		<select name="subnet" bind:value={subnetId}>
			<option value={undefined}>{$i18n.canisters.default_subnet}</option>

			{#each sortedSubnets as { subnetId, specialization } (subnetId)}
				<option value={subnetId}
					>{shortenWithMiddleEllipsis({ text: subnetId })}{nonNullish(specialization)
						? ` (${specialization})`
						: ''}</option
				>
			{/each}
		</select>
	</Value>
</div>
