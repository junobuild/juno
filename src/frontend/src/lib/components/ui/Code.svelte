<script lang="ts">
	import { onMount } from 'svelte';
	import type { highlight as Highlight, languages as Languages } from 'prismjs';
	import { nonNullish } from '$lib/utils/utils';
	import { theme } from '$lib/stores/theme.store';
	import { Theme } from '$lib/types/theme';

	export let code: string;
	export let language: string = 'javascript';

	let highlight: undefined | typeof Highlight;
	let languages: undefined | typeof Languages;
	let grammarLoaded = false;

	onMount(async () => {
		const { highlight: h, languages: l } = await import('prismjs');
		highlight = h;
		languages = l;

		const script: HTMLScriptElement = document.createElement('script');
		script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${language}.min.js`;
		script.defer = true;
		script.addEventListener('load', () => (grammarLoaded = true), { once: true });
		script.addEventListener('error', () => (grammarLoaded = true), { once: true });
		document.head.appendChild(script);
	});
</script>

<svelte:head>
	{#if $theme === Theme.DARK}
		<link
			href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-vsc-dark-plus.min.css"
			rel="stylesheet"
		/>
	{:else}
		<link
			href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-vs.min.css"
			rel="stylesheet"
		/>
	{/if}
</svelte:head>

<div class="card-container">
	{#if nonNullish(highlight) && nonNullish(languages) && grammarLoaded}<pre>{@html highlight(
				code,
				languages[language],
				language
			)}</pre>{/if}
</div>

<style lang="scss">
	pre {
		margin: 0;
		white-space: pre-wrap;
	}
</style>
