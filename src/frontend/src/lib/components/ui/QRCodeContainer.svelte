<script lang="ts">
	import QRCode from '$lib/components/ui/QRCode.svelte';

	export let ariaLabel: string | undefined = undefined;
	export let value: string;
</script>

<div class="qrcode">
	<div>
		<QRCode {value} {ariaLabel} />
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/shadow';

	.qrcode {
		min-width: calc(var(--padding) * 30);
		padding: var(--padding-2x);

		background: var(--color-card-contrast);
		color: var(--color-card);

		border-radius: calc(var(--border-radius) * 4);

		> div {
			border: 2px solid var(--color-card);
		}
	}
</style>
