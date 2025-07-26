<script lang="ts">
	import WalletGetICP from '$lib/components/wallet/WalletGetICP.svelte';
	import WalletReceive from '$lib/components/wallet/WalletReceive.svelte';
	import WalletSend from '$lib/components/wallet/WalletSend.svelte';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		onsend?: () => void;
		onreceive: () => void;
	}

	let { missionControlId, onreceive, onsend }: Props = $props();
</script>

<div class="toolbar">
	<WalletGetICP {missionControlId} />

	<WalletReceive {onreceive} />

	<WalletSend {onsend} />
</div>
