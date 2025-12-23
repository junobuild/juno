<script lang="ts">
	import WalletGetICP from '$lib/components/wallet/WalletGetICP.svelte';
	import WalletReceive from '$lib/components/wallet/WalletReceive.svelte';
	import WalletSend from '$lib/components/wallet/WalletSend.svelte';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';

	interface Props {
		selectedWallet: SelectedWallet;
		onsend?: () => void;
		onreceive: () => void;
	}

	let { selectedWallet, onreceive, onsend }: Props = $props();
</script>

<div class="toolbar">
	<WalletGetICP {selectedWallet} />

	<WalletReceive {onreceive} />

	<WalletSend {onsend} {selectedWallet} />
</div>
