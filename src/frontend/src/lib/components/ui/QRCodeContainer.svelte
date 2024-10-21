<script lang="ts">
	import { quintOut, circOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import QRCode from '$lib/components/ui/QRCode.svelte';

	export let ariaLabel: string | undefined = undefined;
	export let value: string;
</script>

<div
	class="qrcode"
	in:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}
	out:slide={{ delay: 0, duration: 100, easing: circOut, axis: 'y' }}
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
