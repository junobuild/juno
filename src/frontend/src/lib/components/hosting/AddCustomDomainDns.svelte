<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import Copy from '$lib/components/ui/Copy.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		domainNameInput: string;
		dns: CustomDomainDns | undefined;
		edit?: boolean;
	}

	let { domainNameInput, dns, edit = false }: Props = $props();

	const dispatch = createEventDispatcher();
</script>

<h2>{$i18n.hosting.configure}</h2>

<p>
	<Html
		text={i18nFormat($i18n.hosting.add_records, [
			{
				placeholder: '{0}',
				value: domainNameInput ?? ''
			}
		])}
	/>
</p>

<section>
	<p class="title">{$i18n.hosting.type}</p>
	<p class="title">{$i18n.hosting.host}</p>
	<p class="title value">{$i18n.hosting.value}</p>

	{#each dns?.entries ?? [] as { type, host, value } (value)}
		<p class="td">{type}</p>
		<p class="td">
			{#if nonNullish(host)}
				<span>{host}</span>
				<Copy value={host} />
			{/if}
		</p>
		<p class="value td">
			<span>{value}</span>
			<Copy {value} />
		</p>
	{/each}
</section>

<p class="notes"><Html text={$i18n.hosting.dns_notes} /></p>

<div class="toolbar">
	{#if !edit}
		<button onclick={() => dispatch('junoBack')}>{$i18n.core.back}</button>
		<button onclick={() => dispatch('junoSubmit')}>{$i18n.core.ready}</button>
	{:else}
		<button onclick={() => dispatch('junoClose')}>{$i18n.core.close}</button>
		<button onclick={() => dispatch('junoSubmit')}>{$i18n.core.submit}</button>
	{/if}
</div>

<style lang="scss">
	@use '../../styles/mixins/collections';
	@use '../../styles/mixins/shadow';
	@use '../../styles/mixins/text';

	section {
		display: grid;
		grid-template-columns: repeat(4, auto);

		@include shadow.shadow;

		p {
			display: inline-flex;
			align-items: center;
			gap: var(--padding);
			margin: 0;
		}

		span {
			@include text.truncate;
		}
	}

	.title {
		@include collections.title-style;
	}

	.value {
		grid-column: span 2;
	}

	.toolbar {
		padding: var(--padding) 0 0 0;
	}

	.notes {
		margin: var(--padding-4x) 0 var(--padding-2x);
	}
</style>
