<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { onMount } from 'svelte';
	import { loadSubnetId } from '$lib/services/ic.services';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { nonNullish } from '@dfinity/utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import type { PrincipalText } from '$lib/types/itentity';
	import { subnetsStore } from '$lib/stores/subnets.store';
	import type { Subnet } from '$lib/types/subnet';

	export let canisterId: Principal;

	onMount(async () => {
		await loadSubnetId({
			canisterId
		});
	});

	let subnet: Subnet | null | undefined;
	$: subnet = $subnetsStore[canisterId.toText()];

	let subnetId: PrincipalText | undefined;
	$: subnetId = subnet?.subnetId;
</script>

<div>
	<Value>
		<svelte:fragment slot="label">{$i18n.canisters.subnet_id}</svelte:fragment>
		{#if nonNullish(subnetId)}
			<Identifier identifier={subnetId} small={false} />
		{:else}
			<SkeletonText />
		{/if}
	</Value>
</div>
