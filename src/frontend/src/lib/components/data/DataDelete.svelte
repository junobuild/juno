<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { emit } from '$lib/utils/events.utils';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	interface Props {
		deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
		button?: Snippet;
		title?: Snippet;
		children: Snippet;
	}

	let { deleteData, button, title, children }: Props = $props();

	let visible: boolean = $state(false);

	const close = () => (visible = false);

	let collection: string | undefined = $derived($store.rule?.[0]);

	let satelliteId: Principal = $derived($store.satelliteId);

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

			listParamsStore.reload();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.data_delete,
				detail: err
			});
		}

		close();

		emit({ message: 'junoCloseActions' });

		busy.stop();
	};
</script>

<button class="menu" onclick={() => (visible = true)} type="button"
	><IconDelete size="20px" /> {@render button?.()}</button
>

<Confirmation {children} {title} bind:visible on:junoYes={deleteSelectedData} on:junoNo={close} />
