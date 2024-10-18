<script lang="ts">
	import QRCode from '$lib/components/ui/QRCode.svelte';

	export let ariaLabel: string | undefined = undefined;
	export let value: string;
</script>

<div class="qrcode">
	<QRCode {value} {ariaLabel} />
</div>

<style lang="scss">
	@use '../../styles/mixins/shadow';

	.qrcode {
		min-width: calc(var(--padding) * 30);
		padding: var(--padding-2x);

		aspect-ratio: 1;

		@include shadow.card-action;
	}
</style>
