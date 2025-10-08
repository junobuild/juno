<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, jsonReplacer } from '@dfinity/utils';
	import { fromArray } from '@junobuild/utils';
	import { getContext } from 'svelte';
	import { deleteDoc } from '$lib/api/satellites.api';
	import DataHeader from '$lib/components/data/DataHeader.svelte';
	import DataKeyDelete from '$lib/components/data/DataKeyDelete.svelte';
	import DocUpload from '$lib/components/docs/DocUpload.svelte';
	import IconDownload from '$lib/components/icons/IconDownload.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import type { SatelliteDid } from '$lib/types/declarations';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { filenameTimestamp, JSON_PICKER_OPTIONS, saveToFileSystem } from '$lib/utils/save.utils';

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);
	const { store: docsStore, resetData }: DataContext<SatelliteDid.Doc> =
		getContext<DataContext<SatelliteDid.Doc>>(DATA_CONTEXT_KEY);

	let collection: string | undefined = $derived($store.rule?.[0]);

	let key: string | undefined = $derived($docsStore?.key);

	/**
	 * Delete data
	 */

	let doc = $derived($docsStore?.data);

	const deleteData = async (params: { collection: string; satelliteId: Principal }) => {
		if (isNullish(key) || key === '') {
			toasts.error({
				text: $i18n.errors.key_invalid
			});
			return;
		}

		await deleteDoc({
			...params,
			key,
			doc,
			identity: $authStore.identity
		});

		resetData();
	};

	const download = async () => {
		if (isNullish(doc)) {
			toasts.error({
				text: $i18n.errors.document_invalid
			});
			return;
		}

		if (isNullish(key) || key === '') {
			toasts.error({
				text: $i18n.errors.key_invalid
			});
			return;
		}

		const data = await fromArray(doc.data);

		const json = JSON.stringify(data, jsonReplacer);

		await saveToFileSystem({
			blob: new Blob([json], {
				type: 'application/json'
			}),
			filename: `${key}_${filenameTimestamp()}.json`,
			type: JSON_PICKER_OPTIONS
		});
	};

	const reloadRules = async () => await reload({ identity: $authStore.identity });
</script>

<div class="title doc">
	<DataHeader>
		{key ?? ''}

		{#snippet actions()}
			<DocUpload {doc} docKey={key} onfileuploaded={reloadRules}>
				{#snippet action()}
					{$i18n.document.replace_document}
				{/snippet}
				{#snippet title()}
					{$i18n.document.replace_document}
				{/snippet}
				{#snippet description()}
					<Html
						text={i18nFormat($i18n.document.replace_description, [
							{
								placeholder: '{0}',
								value: collection ?? ''
							}
						])}
					/>
				{/snippet}
			</DocUpload>

			<button class="menu" onclick={download} type="button"
				><IconDownload size="20px" /> {$i18n.document.download_document}</button
			>

			<DataKeyDelete {deleteData}>
				{#snippet title()}
					{$i18n.document.delete}
				{/snippet}
				{key}
			</DataKeyDelete>
		{/snippet}
	</DataHeader>
</div>

<style lang="scss">
	@use '../../styles/mixins/collections';
	@use '../../styles/mixins/media';

	.title {
		@include collections.title;
	}

	.doc {
		grid-column: span 4;

		@include media.min-width(large) {
			grid-column-start: 3;
			grid-column-end: 5;
		}
	}
</style>
