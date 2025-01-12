<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { loadSubnetId } from '$lib/services/subnets.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { subnetStore } from '$lib/stores/subnet.store';
	import type { Subnet } from '$lib/types/subnet';
	import type { Option } from '$lib/types/utils';
	import type { PrincipalText } from '$lib/types/principal';

	interface Props {
		canisterId: Principal;
	}

	let { canisterId }: Props = $props();

	onMount(async () => {
		await loadSubnetId({
			canisterId
		});
	});

	let subnet: Option<Subnet> = $derived($subnetStore?.[canisterId.toText()]);

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

{#if notEmptyString(subnet?.type)}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.canisters.subnet_type}
			{/snippet}
			<p class="specialization">{subnet?.specialization ?? ''}</p>
		</Value>
	</div>
{/if}

<style lang="scss">
	.specialization {
		text-transform: capitalize;
	}
</style>
