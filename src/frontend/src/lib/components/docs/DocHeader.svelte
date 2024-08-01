<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { getContext } from 'svelte';
	import {isNullish, jsonReplacer} from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import DataHeader from '$lib/components/data/DataHeader.svelte';
	import type { Doc } from '$declarations/satellite/satellite.did';
	import type { Principal } from '@dfinity/principal';
	import { deleteDoc } from '$lib/api/satellites.api';
	import DataKeyDelete from '$lib/components/data/DataKeyDelete.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import DocUpload from '$lib/components/docs/DocUpload.svelte';
	import IconDownload from "$lib/components/icons/IconDownload.svelte";
	import {fromArray} from "@junobuild/utils";
	import {filenameTimestamp, JSON_PICKER_OPTIONS, saveToFileSystem} from "$lib/utils/save.utils";

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);
	const { store: docsStore, resetData }: DataContext<Doc> =
		getContext<DataContext<Doc>>(DATA_CONTEXT_KEY);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let key: string | undefined;
	$: key = $docsStore?.key;

	/**
	 * Delete data
	 */

	let doc: Doc | undefined;
	$: doc = $docsStore?.data;

	let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
	$: deleteData = async (params: { collection: string; satelliteId: Principal }) => {
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
	}
</script>

<div class="title doc">
	<DataHeader>
		{key ?? ''}

		<svelte:fragment slot="actions">
			<DocUpload on:junoUploaded={reload} {doc} docKey={key}>
				<svelte:fragment slot="action">{$i18n.document.replace_document}</svelte:fragment>
				<svelte:fragment slot="title">{$i18n.document.replace_document}</svelte:fragment>
				{@html i18nFormat($i18n.document.replace_description, [
					{
						placeholder: '{0}',
						value: collection ?? ''
					}
				])}
			</DocUpload>

			<button class="menu" type="button" on:click={download}
			><IconDownload size="20px" /> {$i18n.document.download_document}</button
			>

			<DataKeyDelete {deleteData}>
				<svelte:fragment slot="title">{$i18n.document.delete}</svelte:fragment>
				{key}
			</DataKeyDelete>
		</svelte:fragment>
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
