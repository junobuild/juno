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
		width: calc(var(--padding) * 30);
		margin: var(--padding) 0;
		padding: var(--padding-2x);
		background: white;
		border: 3px solid var(--color-card-contrast);
	}
</style>
