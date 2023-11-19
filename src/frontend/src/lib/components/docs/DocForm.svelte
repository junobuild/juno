<script lang="ts">
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import { DocFieldTypeEnum, type DocField } from '$lib/types/doc-form';
	import DocFormField from './DocFormField.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext } from 'svelte';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { nanoid } from 'nanoid';
	import {
		DATA_CONTEXT_KEY,
		type DataStoreAction,
		type DataContext
	} from '$lib/types/data.context';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import { fade } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import DataHeader from '$lib/components/data/DataHeader.svelte';
	import type { Doc } from '$declarations/satellite/satellite.did';
	import type { Principal } from '@dfinity/principal';
	import { deleteDoc } from '$lib/api/satellites.api';
	import DataKeyDelete from '$lib/components/data/DataKeyDelete.svelte';

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);
	const { store: docsStore, resetData }: DataContext<Doc> =
		getContext<DataContext<Doc>>(DATA_CONTEXT_KEY);

	let action: DataStoreAction | undefined;
	$: action = $docsStore?.action;

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let key: string | undefined;
	$: key = $docsStore?.key;

	const EMPTY_FIELD: DocField = {
		name: '',
		fieldType: DocFieldTypeEnum.STRING,
		value: ''
	};

	let fields: DocField[] = [EMPTY_FIELD];

	const onAddFieldButtonPressed = () => (fields = [...fields, EMPTY_FIELD]);

	const onDeleteFieldPressed = (index: number) => {
		if (fields.length <= 1) {
			return;
		}

		fields = fields.filter((_, i) => i !== index);
	};

	let isFormValid = false;
	$: isFormValid =
		!isNullish(key) &&
		!isNullish(
			fields.find(
				({ name, value }) => nonNullish(name) && name !== '' && nonNullish(value) && value !== ''
			)
		);

	const dispatch = createEventDispatcher();

	let onSubmit: () => Promise<void>;
	$: onSubmit = async () => {
		if (!isFormValid && !collection) return;

		busy.start();

		try {
			/**
			 * TODO:
			 * - add setDoc logic
			 */

			toasts.success($i18n.document.document_submission_success);

			await reload();

			dispatch('junoDocumentSubmissionSuccess');
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.document.document_submission_failed,
				detail: err
			});
		} finally {
			busy.stop();
		}
	};

	let isActive = false;
	$: isActive = action === 'create' || action === 'edit';

	const generateKey = () => (key = nanoid());

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
			doc
		});

		resetData();
	};
</script>

<div class="title doc-form">
	{#if isActive}
		{$i18n.document_form.title_add_new_document}
	{:else}
		<DataHeader>
			{key ?? ''}

			<svelte:fragment slot="actions">
				<DataKeyDelete {deleteData}>
					<svelte:fragment slot="title">{$i18n.document.delete}</svelte:fragment>
					{key}
				</DataKeyDelete>
			</svelte:fragment>
		</DataHeader>
	{/if}
</div>

{#if isActive}
	<article class="doc-form" in:fade>
		<form on:submit|preventDefault={onSubmit}>
			<Value ref="doc-id">
				<svelte:fragment slot="label">{$i18n.document_form.field_doc_key_label}</svelte:fragment>
				<div class="form-doc-id">
					<input
						id="doc-id"
						type="text"
						placeholder={$i18n.document_form.field_doc_key_placeholder}
						name="doc_id"
						bind:value={key}
					/>
					<button
						class="text action start"
						type="button"
						on:click={generateKey}
						aria-label={$i18n.document_form.field_doc_key_btn_auto_key}
					>
						<IconAutoRenew />
					</button>
				</div>
			</Value>

			{#each fields as field, i (i)}
				<DocFormField
					bind:name={field.name}
					bind:fieldType={field.fieldType}
					bind:value={field.value}
					deleteButton={fields.length > 1}
					on:junoDelete={() => onDeleteFieldPressed(i)}
				/>
			{/each}

			<button class="text action start" type="button" on:click={onAddFieldButtonPressed}>
				<IconNew size="16px" />
				<span>{$i18n.document_form.btn_add_field}</span>
			</button>

			<div class="button-wrapper">
				<button type="submit" class="primary" disabled={!isFormValid}>{$i18n.core.submit}</button>
			</div>
		</form>
	</article>
{/if}

<style lang="scss">
	@use '../../styles/mixins/collections';
	@use '../../styles/mixins/media';

	.title {
		@include collections.title;
	}

	.doc-form {
		grid-column: span 4;

		@include media.min-width(large) {
			grid-column-start: 3;
			grid-column-end: 5;
		}
	}

	article {
		display: flex;
		flex-direction: column;

		padding: var(--padding-2x) var(--padding-2x) 0;
	}

	.button-wrapper {
		margin-top: var(--padding-2x);
	}

	.form-doc-id {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);
		margin-bottom: var(--padding-2x);
	}
</style>
