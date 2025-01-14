<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import { IC_TRANSACTION_FEE_ICP } from '$lib/constants/constants';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatICP } from '$lib/utils/icp.utils';

	interface Props {
		balance: bigint | undefined;
		onmax: (max: string) => void;
	}

	let { onmax, balance }: Props = $props();

	const calculateMax = ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();

		if (isNullish(balance) || balance <= 0n) {
			// No error message as we prevent this to happen with the UI.
			return;
		}

		const amount = balance - IC_TRANSACTION_FEE_ICP;

		onmax(formatICP(amount));
	};
</script>

{#if nonNullish(balance) && balance > 0n}
	<button in:fade class="article" onclick={calculateMax} tabindex="-1">
		{$i18n.core.max}
	</button>
{/if}

<style lang="scss">
	button.article {
		background: rgba(var(--color-card-rgb), 0.9);

		box-shadow: none;
		border: none;

		padding: var(--padding-0_5x) var(--padding);
		margin: 0;
	}
</style>
