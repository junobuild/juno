<script lang="ts">
	import { quintOut, circOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import QRCode from '$lib/components/ui/QRCode.svelte';

	interface Props {
		value: string;
	}

	let { value }: Props = $props();
</script>

<div class="qrcode" in:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}>
	<QRCode {value} />
</div>

<style lang="scss">
	@use '../../styles/mixins/shadow';

	.qrcode {
		min-width: calc(var(--padding) * 30);

		aspect-ratio: 1;
		overflow: hidden;

		@include shadow.card-action;
	}
</style>
