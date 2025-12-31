<script lang="ts">
	import type { Snippet } from 'svelte';
	import GetICPInfo from '$lib/components/wallet/GetICPInfo.svelte';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Option } from '$lib/types/utils';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import FactoryCreditsWithFee from '$lib/components/factory/FactoryCreditsWithFee.svelte';

	interface Props {
		detail: JunoModalDetail;
		priceLabel: string;
		selectedWallet: SelectedWallet | undefined;
		withFee: Option<bigint>;
		insufficientFunds?: boolean;
		children: Snippet;
		onclose: () => void;
	}

	let {
		detail,
		priceLabel,
		selectedWallet,
		insufficientFunds = $bindable(true),
		withFee = $bindable(undefined),
		children,
		onclose
	}: Props = $props();

	let { fee: factoryFee } = $derived(detail as JunoModalCreateSegmentDetail);

	let fee = $derived(
		selectedWallet?.type === 'mission_control'
			? fromNullable(factoryFee.fee_icp)?.e8s
			: factoryFee.fee_cycles.e12s
	);
</script>

{#if isNullish(fee)}
	<GetICPInfo {onclose} />
{:else}
	<FactoryCreditsWithFee
		{priceLabel}
		{selectedWallet}
		bind:insufficientFunds
		bind:withFee
		{onclose}
		{fee}
	>
		{@render children()}
	</FactoryCreditsWithFee>
{/if}
