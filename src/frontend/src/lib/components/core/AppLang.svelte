<script lang="ts">
	import AppLangSelect from '$lib/components/core/AppLangSelect.svelte';
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import type { Languages } from '$lib/types/languages';

	let lang: Languages = $state('en');
</script>

<div class="actions">
	<div class="select">
		<button class="text action select-action"
			><span>
				{#if lang === 'zh-cn'}
					简体中文
				{:else}
					English
				{/if}</span
			>

			<IconArrowDropDown size="16px" /></button
		>

		<AppLangSelect bind:selected={lang} />
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.actions {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);

		font-size: var(--font-size-ultra-small);

		button:not(.select-action) {
			display: none;
		}

		@include media.min-width(small) {
			button:not(.select-action) {
				display: inherit;
			}
		}

		:global(label) {
			display: none;
		}

		:global(select) {
			position: absolute;
			top: 0;
			left: 0;
			opacity: 0;
			cursor: pointer;
		}
	}

	.select {
		position: relative;
	}

	button.text {
		text-decoration: none;
		margin: 0;
	}
</style>
