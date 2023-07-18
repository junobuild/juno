<script lang="ts">
	import QRCode from '$lib/components/ui/QRCode.svelte';

	export let ariaLabel: string | undefined = undefined;
	export let value: string;
</script>

<div class="qrcode">
	<QRCode {value} {ariaLabel} />
</div>

<style lang="scss">
	.qrcode {
		width: 210px;
		margin: var(--padding) 0;
		padding: var(--padding-2x);
		background: white;
	}
</style>
