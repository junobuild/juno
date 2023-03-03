<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconSort from '$lib/components/icons/IconSort.svelte';
	import Popover from "$lib/components/ui/Popover.svelte";
	import type {ListOrderField} from "$declarations/satellite/satellite.did";
	import {OrderFieldCreatedAt, OrderFieldKeys, OrderFieldUpdatedAt} from "$lib/constants/order.constants";

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	let field: ListOrderField = OrderFieldKeys;
	let desc = false;
</script>

<div class="sort">
	<span><slot /></span>

	<button class="icon" aria-label={$i18n.sort.title} type="button" on:click={() => visible = true} bind:this={button}
		><IconSort size="20px" /></button
	>
</div>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<p class="category">{$i18n.sort.sort_by_field}</p>

		<label>
			<input type=radio bind:group={field} name="field" value={OrderFieldKeys}>
			<span>{$i18n.sort.keys}</span>
		</label>

		<label>
			<input type=radio bind:group={field} name="field" value={OrderFieldCreatedAt}>
			<span>{$i18n.sort.created_at}</span>
		</label>

		<label>
			<input type=radio bind:group={field} name="field" value={OrderFieldUpdatedAt}>
			<span>{$i18n.sort.updated_at}</span>
		</label>

		<p class="category sort">{$i18n.sort.sort_results}</p>

		<label>
			<input type=radio bind:group={desc} name="desc" value={false}>
			<span>{$i18n.sort.ascending}</span>
		</label>

		<label>
			<input type=radio bind:group={desc} name="desc" value={true}>
			<span>{$i18n.sort.descending}</span>
		</label>

		<button type="button" on:click|stopPropagation={close}>
			{$i18n.core.apply}
		</button>
	</div>
</Popover>

<style lang="scss">
	.sort {
		display: flex;
		justify-content: space-between;
	}

	button.icon {
		padding: 0;
	}

	.container {
		padding: var(--padding);
	}

	label {
		display: flex;
		gap: var(--padding-2x);
		align-items: center;

		cursor: pointer;
	}

	.category {
		font-weight: var(--font-weight-bold);
		margin: 0 0 var(--padding);
	}

	label span {
		color: var(--value-color);
	}

	.sort {
		padding: var(--padding) 0 0;
	}
</style>
