<script lang="ts">
	import QRCode from '$lib/components/ui/QRCode.svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let ariaLabel: string | undefined = undefined;
	export let value: string;
</script>

<div
	class="qrcode"
	in:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}
	out:slide={{ delay: 0, duration: 50, easing: quintOut, axis: 'y' }}
>
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
