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
		width: calc(var(--padding) * 40);
		padding: var(--padding-2x);
		margin: var(--padding) 0;
	}
</style>
