<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Rule, CollectionType } from '$declarations/satellite/satellite.did';
	import { deleteRule } from '$lib/api/satellites.api';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		collection: string;
		rule: Rule | undefined;
		type: CollectionType;
	}

	let { collection, rule, type }: Props = $props();

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let visible = $state(false);

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
				rule,
				identity: $authStore.identity
			});

			await reload({ identity: $authStore.identity });

			toasts.success({
				text: i18nFormat($i18n.collections.deleted, [
					{
						placeholder: '{0}',
						value: collection
					}
				])
			});

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

<button type="button" onclick={() => (visible = true)}>{$i18n.core.delete}</button>

<Confirmation bind:visible on:junoYes={deleteCollection} on:junoNo={close}>
	{#snippet title()}
		{$i18n.collections.delete_question}
	{/snippet}

	<Value>
		{#snippet label()}
			{$i18n.collections.key}
		{/snippet}
		<p>{collection}</p>
	</Value>
</Confirmation>
