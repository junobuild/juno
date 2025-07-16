<!-- @migration-task Error while migrating Svelte code: Can't migrate code with afterUpdate. Please migrate by hand. -->
<script lang="ts">
	/**
	 * Source gix-components: https://gix.design
	 */
	import { isNullish, nonNullish, debounce } from '@dfinity/utils';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.store';
	import type { QrCreateClass } from '$lib/types/qr-creator';
	import { Theme } from '$lib/types/theme';

	// TODO: migrate to Svelte v5
	// e.g. afterUpdate cannot be used in runes mode

	export let ariaLabel: string | undefined = undefined;
	export let value: string;

	let dark: boolean;
	$: dark = $theme === Theme.DARK;

	// Valid CSS colors
	let fillColor: string;
	$: fillColor = dark ? 'white' : '#242526';

	let backgroundColor: string;
	$: backgroundColor = dark ? '#242526' : 'white';

	// The edge radius of each module. Must be between 0 and 0.5.
	export let radius = 0;
	// https://www.qrcode.com/en/about/error_correction.html
	export let ecLevel: 'L' | 'M' | 'Q' | 'H' = 'H';

	let label: string;
	$: label =
		ariaLabel !== undefined && nonNullish(ariaLabel) && ariaLabel.length > 0 ? ariaLabel : value;

	let container: HTMLDivElement | undefined;
	let size: { width: number } | undefined = undefined;

	// Add a small debounce in case the screen is resized
	const initSize = debounce(() => {
		if (isNullish(container)) {
			size = undefined;
			return;
		}

		const { width } = container.getBoundingClientRect();
		size = {
			width
		};
	}, 25);

	const isBrowser = typeof window !== 'undefined';

	let QrCreator: QrCreateClass | undefined;
	onMount(async () => {
		// The qr-creator library is not compatible with NodeJS environment
		if (!isBrowser) {
			return;
		}

		// TODO: is it still the case with vitest?
		// The library leads to issues (es modules import error, segmentation fault, blocking tests etc.) in jest tests of NNS-dapp when use explicitly or imported implicitly.
		// Therefore, the simplest way to avoid these problems is to skip it globally in jest tests.
		// It remains tested in e2e tests.
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (process.env.NODE_ENV === 'test') {
			return;
		}

		const JUNO_CDN_URL = import.meta.env.VITE_JUNO_CDN_URL;
		const qrCreatorLib = `${JUNO_CDN_URL}/libs/qr-creator/1.0.0/dist/qr-creator.es6.min.js`;

		QrCreator = (await import(qrCreatorLib)).default;
	});

	let once = false;
	afterUpdate(() => {
		if (once) {
			return;
		}

		initSize();
		once = true;
	});

	const dispatch = createEventDispatcher();

	const renderCanvas = () => {
		if (isNullish(canvas) || isNullish(size)) {
			return;
		}

		QrCreator?.render(
			{
				text: value,
				radius,
				ecLevel,
				fill: fillColor,
				background: backgroundColor,
				// We draw the canvas larger and scale its container down to avoid blurring on high-density displays
				size: size.width * 2
			},
			canvas
		);

		dispatch('nnsQRCodeRendered');
	};

	let canvas: HTMLCanvasElement | undefined;
	$: (QrCreator, value, canvas, dark, (() => renderCanvas())());

	let showLogo: boolean;
	$: showLogo = nonNullish($$slots.logo);
</script>

<svelte:window on:resize={initSize} />

<div
	class="container"
	bind:this={container}
	data-tid="qr-code"
	style={`height: ${nonNullish(size) && size.width > 0 ? `${size.width}px` : '100%'}`}
>
	{#if nonNullish(size)}
		<canvas
			bind:this={canvas}
			aria-label={label}
			style={`width: ${size.width > 0 ? `${size.width}px` : '100%'}; height: ${
				size.width > 0 ? `${size.width}px` : '100%'
			}`}
		></canvas>
	{/if}

	{#if showLogo}
		<div class="logo">
			<slot name="logo" />
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
</style>
