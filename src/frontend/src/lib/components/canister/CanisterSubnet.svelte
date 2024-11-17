<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { loadSubnetId } from '$lib/services/ic.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { subnetsStore } from '$lib/stores/subnets.store';
	import type { PrincipalText } from '$lib/types/itentity';
	import type { Subnet } from '$lib/types/subnet';
	import type { Option } from '$lib/types/utils';

	interface Props {
		canisterId: Principal;
	}

	let { canisterId }: Props = $props();

	onMount(async () => {
		await loadSubnetId({
			canisterId
		});
	});

	let subnet: Option<Subnet> = $derived($subnetsStore[canisterId.toText()]);

	let subnetId: PrincipalText | undefined = $derived(subnet?.subnetId);
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.canisters.subnet_id}
		{/snippet}
		{#if nonNullish(subnetId)}
			<Identifier identifier={subnetId} small={false} />
		{:else}
			<SkeletonText />
		{/if}
	</Value>
</div>
