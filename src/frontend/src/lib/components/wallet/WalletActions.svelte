<script lang="ts">
	import WalletGetICP from '$lib/components/wallet/WalletGetICP.svelte';
	import WalletReceive from '$lib/components/wallet/WalletReceive.svelte';
	import WalletSend from '$lib/components/wallet/WalletSend.svelte';
	import type { WalletId } from '$lib/schemas/wallet.schema';

	interface Props {
		walletId: WalletId;
		onsend?: () => void;
		onreceive: () => void;
	}

	let { walletId, onreceive, onsend }: Props = $props();
</script>

<div class="toolbar">
	<WalletGetICP {walletId} />

	<WalletReceive {onreceive} />

	<WalletSend {onsend} />
</div>
