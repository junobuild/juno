<script lang="ts">
	import Popover from '$lib/components/ui/Popover.svelte';
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Resource from '$lib/components/examples/Resource.svelte';
	import IconDatastore from '$lib/components/icons/IconDatastore.svelte';
	import IconAuthentication from '$lib/components/icons/IconAuthentication.svelte';
	import IconStorage from '$lib/components/icons/IconStorage.svelte';
	import IconHosting from '$lib/components/icons/IconHosting.svelte';
	import AppLang from '$lib/components/core/AppLang.svelte';
	import IconBook from '$lib/components/icons/IconBook.svelte';
	import IconScience from '$lib/components/icons/IconScience.svelte';

	let anchor: HTMLDivElement | undefined;
	let visible = false;
	let category: 'product' | 'developers' = 'product';

	const openProduct = () => {
		category = 'product';
		visible = true;
	};

	const openDevelopers = () => {
		category = 'developers';
		visible = true;
	};

	let select: HTMLSelectElement;
	let lang: Languages;

	let innerWidth = 0;
</script>

<div bind:this={anchor} class="actions">
	<button class="text action" on:click={openProduct}
		><span>{$i18n.resources.product}</span> <IconArrowDropDown size="16px" /></button
	>

	<button class="text action" on:click={openDevelopers}
		><span>{$i18n.resources.developers}</span> <IconArrowDropDown size="16px" /></button
	>

	<div class="select">
		<button class="text action select-action"
			><span>
				{#if lang === 'zh-cn'}
					中国大陆
				{:else if lang === 'it'}
					Italiano
				{:else}
					English
				{/if}</span
			>

			<IconArrowDropDown size="16px" /></button
		>

		<AppLang bind:selected={lang} />
	</div>
</div>

<svelte:window bind:innerWidth />

<Popover
	bind:visible
	{anchor}
	--popover-min-size={innerWidth < 1024 ? '340px' : 'calc(45vw - 0.45rem)'}
>
	<div class="content">
		{#if category === 'developers'}
			<Resource href="https://github.com/buildwithjuno/examples">
				<IconBook slot="icon" />
				<svelte:fragment slot="title">{$i18n.resources.resources}</svelte:fragment>

				{$i18n.resources.resources_description}
			</Resource>

			<Resource href="https://github.com/buildwithjuno/juno/releases">
				<IconScience slot="icon" />
				<svelte:fragment slot="title">{$i18n.resources.changelog}</svelte:fragment>

				{$i18n.resources.changelog_description}
			</Resource>
		{:else}
			<Resource href="https://juno.build/docs/build/authentication">
				<IconAuthentication slot="icon" />
				<svelte:fragment slot="title">{$i18n.authentication.title}</svelte:fragment>

				{$i18n.authentication.short_description}
			</Resource>

			<Resource href="https://juno.build/docs/build/datastore">
				<IconDatastore slot="icon" />
				<svelte:fragment slot="title">{$i18n.datastore.title}</svelte:fragment>

				{$i18n.datastore.short_description}
			</Resource>

			<Resource href="https://juno.build/docs/build/storage">
				<IconStorage slot="icon" />
				<svelte:fragment slot="title">{$i18n.storage.title}</svelte:fragment>

				{$i18n.storage.short_description}
			</Resource>

			<Resource href="https://juno.build/docs/build/hosting">
				<IconHosting slot="icon" />
				<svelte:fragment slot="title">{$i18n.hosting.title}</svelte:fragment>

				{$i18n.hosting.short_description}
			</Resource>
		{/if}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/media';

	.actions {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);

		font-size: var(--font-size-small);

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

	.content {
		display: flex;
		flex-direction: column;

		padding: var(--padding-2x);

		max-height: 70vh;
		overflow-y: auto;

		@include media.min-width(large) {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
		}

		:global(a) {
			box-shadow: none;
			border: none;
			grid-column: inherit;
		}

		:global(div.icon) {
			display: none;
		}
	}
</style>
