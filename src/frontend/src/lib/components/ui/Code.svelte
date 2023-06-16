<script lang="ts">
	import { onMount } from 'svelte';
	import type Prism from 'prismjs';
	import { nonNullish } from '$lib/utils/utils';
	import { theme } from '$lib/stores/theme.store';
	import { Theme } from '$lib/types/theme';
	import Copy from '$lib/components/ui/Copy.svelte';

	export let code: string;
	export let language: string = 'javascript';
	export let copy: 'center' | 'bottom' = 'center';

	let parseCode: string | undefined;

	const inject = (src: string): Promise<void> =>
		new Promise((resolve) => {
			const script: HTMLScriptElement = document.createElement('script');
			script.src = src;
			script.addEventListener('load', () => resolve(), { once: true });
			script.addEventListener('error', () => resolve(), { once: true });
			document.head.appendChild(script);
		});

	const JUNO_CDN_URL = import.meta.env.VITE_JUNO_CDN_URL;

	const injectPrism = (): Promise<void> =>
		inject(`${JUNO_CDN_URL}/libs/prismjs/1.29.0/prism.min.js`);

	const injectGrammar = (): Promise<void> =>
		inject(`${JUNO_CDN_URL}/libs/prismjs/1.29.0/components/prism-${language}.min.js`);

	onMount(async () => {
		await injectPrism();

		// Prism has to be loaded before loading the grammar
		await injectGrammar();

		parseCode = Prism.highlight(code, Prism.languages[language], language);
	});
</script>

<svelte:head>
	{#if $theme === Theme.DARK}
		<link
			href={`${JUNO_CDN_URL}/libs/prism-themes/1.9.0/themes/prism-vsc-dark-plus.min.css`}
			rel="stylesheet"
		/>
	{:else}
		<link href={`${JUNO_CDN_URL}/libs/prism-themes/1.9.0/themes/prism-vs.min.css`} rel="stylesheet" />
	{/if}
</svelte:head>

<div class="card-container">
	{#if nonNullish(parseCode)}<pre>{@html parseCode}</pre>{/if}

	<div class={`${copy} copy`}>
		<Copy value={code} />
	</div>
</div>

<style lang="scss">
	.card-container {
		position: relative;
		min-height: var(--code-min-height);
	}

	.copy {
		position: absolute;
		right: var(--padding-2x);
		bottom: 50%;
		transform: translate(0, 45%);

		&.bottom {
			bottom: var(--padding);
			transform: none;
		}
	}
</style>
