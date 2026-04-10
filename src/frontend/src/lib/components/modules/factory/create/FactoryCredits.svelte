<script lang="ts">
	import { fromNullable, isNullish } from '@dfinity/utils';
	import type { Nullish } from '@dfinity/zod-schemas';
	import type { Snippet } from 'svelte';
	import FactoryCreditsWithFee from '$lib/components/modules/factory/create/FactoryCreditsWithFee.svelte';
	import FactoryWalletInfo from '$lib/components/modules/factory/create/FactoryWalletInfo.svelte';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		priceLabel: string;
		selectedWallet: SelectedWallet | undefined;
		withFee: Nullish<bigint>;
		insufficientFunds?: boolean;
		children: Snippet;
		onclose: () => void;
	}

	let {
		detail,
		priceLabel,
		selectedWallet = $bindable(undefined),
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
		bind:selectedWallet
		bind:insufficientFunds
		bind:withFee
	>
		{@render children()}
	</FactoryCreditsWithFee>
{/if}
