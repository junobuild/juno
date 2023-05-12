<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { isNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { deleteRule } from '$lib/api/satellites.api';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { createEventDispatcher, getContext } from 'svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import type { Rule, RulesType } from '$declarations/satellite/satellite.did';

	export let collection: string;
	export let rule: Rule | undefined;
	export let type: RulesType;

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let visible = false;

	const close = () => (visible = false);

	const dispatch = createEventDispatcher();

	const deleteCollection = async () => {
		busy.start();

		if (isNullish(rule)) {
			toasts.error({
				text: $i18n.errors.rule_invalid
			});
			return;
		}

		try {
			await deleteRule({
				satelliteId: $store.satelliteId,
				collection,
				type,
				rule
			});

			await reload();

			toasts.success(
				i18nFormat($i18n.collections.deleted, [
					{
						placeholder: '{0}',
						value: collection
					}
				])
			);

			dispatch('junoCollectionSuccess');
		} catch (err: unknown) {
			toasts.error({
				text: i18nFormat($i18n.errors.collection_deleted, [
					{
						placeholder: '{0}',
						value: collection
					}
				]),
				detail: err
			});
		}

		close();

		busy.stop();
	};
</script>

<button type="button" on:click={() => (visible = true)}>{$i18n.core.delete}</button>

<Confirmation bind:visible on:junoYes={deleteCollection} on:junoNo={close}>
	<svelte:fragment slot="title">{$i18n.collections.delete_question}</svelte:fragment>

	<Value>
		<svelte:fragment slot="label">{$i18n.collections.key}</svelte:fragment>
		<p>{collection}</p>
	</Value>
</Confirmation>
