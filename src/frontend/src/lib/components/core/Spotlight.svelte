<script lang="ts">
	import { debounce, isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import Input from '$lib/components/ui/Input.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { spotlightItems } from '$lib/derived/spotlight.derived';
	import { i18n } from '$lib/stores/i18n.store';

	let visible = $state(false);

	let searchFilter = $state('');
	let debouncedSearchFilter = $state('');

	const updateFilter = () => (debouncedSearchFilter = searchFilter);
	const debounceUpdateFilter = debounce(updateFilter);

	$effect(() => {
		searchFilter;
		untrack(debounceUpdateFilter);
	});

	$effect(() => {
		if (visible) {
			return;
		}

		searchFilter = '';
	});

	const onclose = () => (visible = false);

	const selectItem = (dir: 'up' | 'down') => {
		if (isNullish(itemsRef)) {
			return;
		}

		// a
		const { activeElement } = document;
		const li = activeElement?.parentElement;

		if (nonNullish(li?.parentElement) && li.parentElement.isSameNode(itemsRef)) {
			const next = dir === 'up' ? li.previousElementSibling : li.nextElementSibling;

			if (isNullish(next) && dir === 'up') {
				inputElement?.focus();
				return;
			}

			// Assert it's not null and note a #text
			if (nonNullish(next) && next.nodeType === Node.ELEMENT_NODE) {
				next?.querySelector('a')?.focus();
			}
			return;
		}

		if (nonNullish(itemsRef.firstElementChild) && dir === 'down') {
			(itemsRef.firstElementChild as HTMLElement).querySelector('a')?.focus();
		}

		return;
	};

	const onkeydown = ($event: KeyboardEvent) => {
		const { metaKey, key, ctrlKey } = $event;

		if ((metaKey || ctrlKey) && key === 'k') {
			$event.preventDefault();
			visible = true;
			return;
		}

		switch (key) {
			case 'Escape':
				visible = false;
				return;
			case 'ArrowDown':
				selectItem('down');
				return;
			case 'ArrowUp':
				selectItem('up');
				return;
		}
	};

	let filteredItems = $derived(
		debouncedSearchFilter === ''
			? []
			: $spotlightItems.filter(({ filter }) =>
					filter({
						signedIn: $authSignedIn,
						query: debouncedSearchFilter.toLowerCase()
					})
				)
	);

	let itemsRef: HTMLUListElement | undefined = $state(undefined);
	let inputElement = $state<HTMLInputElement | undefined>(undefined);
</script>

<svelte:window {onkeydown} />

<Popover backdrop="dark" center bind:visible>
	<div class="container">
		<Value>
			{#snippet label()}
				{$i18n.spotlight.search_title}
			{/snippet}

			<Input
				name="destination"
				autofocus
				inputType="text"
				placeholder={$i18n.spotlight.search_placeholder}
				required={false}
				bind:value={searchFilter}
				bind:inputElement
			/>
		</Value>

		{#if filteredItems.length > 0}
			<ul bind:this={itemsRef} transition:fade={{ duration: 150 }}>
				{#each filteredItems as item, index (index)}
					<li>
						{#if item.type === 'nav'}
							{@const Icon = item.icon}
							<a
								class="article"
								aria-haspopup="menu"
								href={item.href}
								onclick={onclose}
								role="menuitem"
								target={item.external === true ? '_blank' : ''}
							>
								<Icon size="24px" />
								<span>{item.text}</span>
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';
	@use '../../styles/mixins/shadow';

	@include dialog.edit;

	.container {
		width: 420px;
		max-width: calc(100vw - var(--padding-4x));
	}

	a.article {
		flex-direction: row;
		gap: var(--padding-2x);
		padding: var(--padding-2x);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin: 0 0 var(--padding);
	}
</style>
