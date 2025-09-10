<script lang="ts">
	import { debounce, isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import SpotlightShortcut from '$lib/components/core/SpotlightShortcut.svelte';
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
				const action = next?.querySelector('a') ?? next?.querySelector('button');
				action?.focus();
			}
			return;
		}

		if (nonNullish(itemsRef.firstElementChild) && dir === 'down') {
			const firstChild = itemsRef.firstElementChild as HTMLElement;
			const action = firstChild.querySelector('a') ?? firstChild.querySelector('button');
			action?.focus();
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
				$event.preventDefault();
				selectItem('down');
				return;
			case 'ArrowUp':
				$event.preventDefault();
				selectItem('up');
				return;
		}
	};

	let filteredItems = $derived(
		$spotlightItems.filter(
			({ filter }) =>
				debouncedSearchFilter === '' ||
				filter({
					signedIn: $authSignedIn,
					query: debouncedSearchFilter.toLowerCase()
				})
		)
	);

	let itemsRef: HTMLUListElement | undefined = $state(undefined);
	let inputElement = $state<HTMLInputElement | undefined>(undefined);
</script>

<svelte:window onjunoSpotlight={() => (visible = true)} {onkeydown} />

<Popover backdrop="dark" center bind:visible>
	<div class="container">
		<div class="search" role="search">
			<Value>
				{#snippet label()}
					{$i18n.spotlight.search_title} (<SpotlightShortcut />)
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
		</div>

		<div class="items">
			{#if filteredItems.length > 0}
				<ul bind:this={itemsRef} transition:fade={{ duration: 150 }}>
					{#each filteredItems as item, index (index)}
						{@const Icon = item.icon}

						<li>
							{#if item.type === 'nav'}
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
							{:else if item.type === 'action'}
								<button class="article" onclick={item.action}>
									<Icon size="24px" />
									<span>{item.text}</span>
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="none" in:fade>No matching routes or actions.</p>
			{/if}
		</div>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';
	@use '../../styles/mixins/shadow';

	@include dialog.edit;

	.container {
		width: 420px;
		max-width: calc(100vw - var(--padding-4x));

		padding: 0;
	}

	a.article,
	button.article {
		flex-direction: row;
		align-items: center;
		gap: var(--padding-2x);
		padding: var(--padding-2x);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;

		max-height: calc(40 * var(--padding));
		min-height: calc(40 * var(--padding));

		overflow-y: auto;
	}

	li {
		margin: 0 0 var(--padding);
	}

	.search {
		padding: var(--padding-2x) var(--padding-3x) 0 var(--padding-2x);

		background: var(--color-menu);
	}

	li,
	.none {
		padding: 0 var(--padding-2x) 0 var(--padding-2x);
	}

	.none {
		font-style: italic;
	}

	.items {
		padding: 0 0 var(--padding);
	}
</style>
