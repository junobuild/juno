<script lang="ts">
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { fade } from 'svelte/transition';
	import { isTokenIcp } from '$lib/utils/token.utils';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		onconvert?: () => void;
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
	}

	let { onconvert, selectedWallet, selectedToken }: Props = $props();

	const openConvertIcpToCycles = async () => {
		onconvert?.();

		emit({
			message: 'junoModal',
			detail: {
				type: 'convert_icp_to_cycles',
				detail: {
					selectedWallet
				}
			}
		});
	};
</script>

{#if selectedWallet.type === 'dev' && isTokenIcp(selectedToken)}
	<button onclick={openConvertIcpToCycles} in:fade>Convert</button>
{/if}
