<script lang="ts">
	import BuyCycles from '$lib/components/wallet/BuyCycles.svelte';
	import WalletGetToken from '$lib/components/wallet/WalletGetToken.svelte';
	import WalletReceive from '$lib/components/wallet/WalletReceive.svelte';
	import WalletSend from '$lib/components/wallet/WalletSend.svelte';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import ConvertIcp from "$lib/components/wallet/ConvertIcp.svelte";

	interface Props {
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
		onsend?: () => void;
		onconvert?: () => void;
		onreceive: () => void;
	}

	let { selectedWallet, selectedToken, onreceive, onconvert, onsend }: Props = $props();
</script>

<div class="toolbar">
	<BuyCycles {selectedToken} {selectedWallet} />

	<WalletReceive {onreceive} />

	<WalletSend {onsend} {selectedToken} {selectedWallet} />

	<ConvertIcp {onconvert} {selectedToken} {selectedWallet} />
</div>

<WalletGetToken {selectedWallet} />
