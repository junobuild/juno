<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { getContext } from 'svelte';
	import { isNullish } from '$lib/utils/utils';
	import type { Principal } from '@dfinity/principal';
	import { listParamsStore } from '$lib/stores/data.store';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	export let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	const close = () => (visible = false);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let satelliteId: Principal;
	$: satelliteId = $store.satelliteId;

	const deleteSelectedData = async () => {
		if (isNullish(collection) || collection === '') {
			toasts.error({
				text: $i18n.errors.collection_invalid
			});
			return;
		}

		busy.start();

		try {
			await deleteData({
				satelliteId,
				collection
			});

			listParamsStore.reset();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.data_delete,
				detail: err
			});
		}

		close();

		busy.stop();
	};
</script>

<button
	class="square"
	aria-label={$i18n.core.delete}
	type="button"
	on:click={() => (visible = true)}
	bind:this={button}><IconDelete size="20px" /></button
>

<Confirmation bind:visible on:junoYes={deleteSelectedData} on:junoNo={close}>
	<slot name="title" slot="title" />

	<Value>
		<svelte:fragment slot="label">{$i18n.collections.key}</svelte:fragment>
		<p><slot /></p>
	</Value>
</Confirmation>

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
</style>
