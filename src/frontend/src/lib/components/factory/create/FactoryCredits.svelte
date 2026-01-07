<script lang="ts">
	import { fromNullable, isNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import FactoryCreditsWithFee from '$lib/components/factory/create/FactoryCreditsWithFee.svelte';
	import FactoryWalletInfo from '$lib/components/factory/create/FactoryWalletInfo.svelte';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Option } from '$lib/types/utils';

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
	<FactoryWalletInfo {onclose} />
{:else}
	<FactoryCreditsWithFee
		{fee}
		{onclose}
		{priceLabel}
		{selectedWallet}
		bind:insufficientFunds
		bind:withFee
	>
		{@render children()}
	</FactoryCreditsWithFee>
{/if}
