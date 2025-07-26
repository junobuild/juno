<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		onreceive: () => void;
	}

	let { onreceive }: Props = $props();
</script>

<button onclick={onreceive}>{$i18n.wallet.receive}</button>
