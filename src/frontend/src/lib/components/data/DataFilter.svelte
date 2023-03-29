<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { listParamsStore } from '$lib/stores/data.store';

	let matcher = $listParamsStore.filter.matcher ?? '';
	let owner = $listParamsStore.filter.owner ?? '';

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	const apply = () => {
		listParamsStore.setFilter({
			matcher,
			owner
		});

		visible = false;
	};

	$: visible,
		(() => {
			if (visible) {
				return;
			}

			// Avoid glitch
			setTimeout(() => {
				matcher = $listParamsStore.filter.matcher ?? '';
				owner = $listParamsStore.filter.owner ?? '';
			}, 250);
		})();
</script>

<button
	class="icon"
	aria-label={$i18n.filter.title}
	type="button"
	on:click={() => (visible = true)}
	bind:this={button}><IconFilter size="20px" /></button
>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<label for="filter-keys">{$i18n.filter.filter_keys}</label>

		<input
			bind:value={matcher}
			id="filter-keys"
			name="filter-keys"
			type="text"
			placeholder={$i18n.filter.placeholder_keys}
		/>

		<label for="filter-owner" class="owner">{$i18n.filter.filter_owner}</label>

		<input
			bind:value={owner}
			id="filter-owner"
			name="filter-owner"
			type="text"
			placeholder={$i18n.filter.placeholder_owners}
		/>

		<button class="apply" type="button" on:click|stopPropagation={apply}>
			{$i18n.core.apply}
		</button>
	</div>
</Popover>

<style lang="scss">
	button.icon {
		padding: 0;
	}

	.container {
		display: flex;
		flex-direction: column;

		width: 100%;

		padding: var(--padding) var(--padding-2x) var(--padding) var(--padding);
	}

	label {
		display: block;
		margin: 0;
		font-weight: var(--font-weight-bold);
	}

	.owner {
		margin-top: var(--padding-1_5x);
	}

	.apply {
		margin: var(--padding-1_5x) 0 var(--padding);
	}
</style>
