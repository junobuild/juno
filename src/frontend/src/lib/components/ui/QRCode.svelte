<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import qrcode from 'qrcode-generator';
	import type { Snippet } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { sanitize } from '$lib/utils/html.utils';

	// TODO: Duplicate qrcode types. There are maybe ways to resolve qrcode.d.ts for the linter
	type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

	type TypeNumber =
		| 0 // Automatic type number
		| 1
		| 2
		| 3
		| 4
		| 5
		| 6
		| 7
		| 8
		| 9
		| 10
		| 11
		| 12
		| 13
		| 14
		| 15
		| 16
		| 17
		| 18
		| 19
		| 20
		| 21
		| 22
		| 23
		| 24
		| 25
		| 26
		| 27
		| 28
		| 29
		| 30
		| 31
		| 32
		| 33
		| 34
		| 35
		| 36
		| 37
		| 38
		| 39
		| 40;

	interface Props {
		value: string;
		ecLevel?: ErrorCorrectionLevel;
		typeNumber?: TypeNumber;
		logo?: Snippet;
	}

	let { value, ecLevel = 'H', typeNumber = 0, logo }: Props = $props();

	let svg = $state<string | undefined>(undefined);

	const renderCanvas = () => {
		const qrGenerator = qrcode(typeNumber, ecLevel);

		qrGenerator.addData(sanitize(value), 'Byte');
		qrGenerator.make();

		svg = qrGenerator.createSvgTag(2, 4);
	};

	$effect(() => {
		value;

		renderCanvas();
	});
</script>

<div class="container" data-tid="qr-code">
	{#if notEmptyString(svg)}
		<div class="qr-code-wrapper">
			<Html text={svg} />
		</div>
	{/if}

	{#if nonNullish(logo)}
		<div class="logo">
			{@render logo()}
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		position: relative;
	}

	.logo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.qr-code-wrapper {
		:global(svg) {
			width: 100%;
			height: 100%;
		}
	}
</style>
