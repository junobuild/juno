<script lang="ts">
	import WalletGetToken from '$lib/components/wallet/WalletGetToken.svelte';
	import WalletReceive from '$lib/components/wallet/WalletReceive.svelte';
	import WalletSend from '$lib/components/wallet/WalletSend.svelte';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';

	interface Props {
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
		onsend?: () => void;
		onreceive: () => void;
	}

	let { selectedWallet, selectedToken, onreceive, onsend }: Props = $props();
</script>

<div class="toolbar">
	<WalletReceive {onreceive} />

	<WalletSend {onsend} {selectedToken} {selectedWallet} />
</div>

<WalletGetToken {selectedWallet} />
