<script lang="ts">
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import { DocFieldTypeEnum, type DocField } from '$lib/types/doc-form';
	import DocFormField from './DocFormField.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext } from 'svelte';
	import { isNullish } from '$lib/utils/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { nanoid } from 'nanoid';
	import {
		DATA_CONTEXT_KEY,
		type DataStoreAction,
		type DataContext
	} from '$lib/types/data.context';
	import type Doc from './Doc.svelte';

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);
	const { store: docsStore }: DataContext<Doc> = getContext<DataContext<Doc>>(DATA_CONTEXT_KEY);

	let action: DataStoreAction | undefined;
	$: action = $docsStore?.action;

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let key: string | undefined;
	$: key = $docsStore?.key;

	let fields: DocField[] = [
		{
			name: '',
			fieldType: DocFieldTypeEnum.STRING,
			value: ''
		}
	];

	const onAddFieldButtonPressed = () => {
		fields = [
			...fields,
			{
				name: '',
				fieldType: DocFieldTypeEnum.STRING,
				value: ''
			}
		];
	};

	const onDeleteFieldPressed = (index: number) => {
		if (fields.length > 1) {
			fields = fields.filter((_, i) => i !== index);
		}
	};

	let isFormValid = false;
	$: isFormValid =
		!isNullish(key) &&
		!isNullish(
			fields.find(
				(field) =>
					!isNullish(field.name) &&
					field.name !== '' &&
					!isNullish(field.value) &&
					field.value !== ''
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
</script>

<p class="title doc-form">{isActive ? $i18n.document.title_add_new_document : ''}</p>

{#if isActive}
	<article class="doc-form">
		<form on:submit|preventDefault={onSubmit}>
			<div>
				<div>
					<label for="doc-id">{$i18n.document.field_doc_id_label}</label>
					<div class="form-doc-id">
						<input
							id="doc-id"
							type="text"
							placeholder="Document ID"
							name="doc_id"
							bind:value={key}
						/>
						<button type="button" class="primary" on:click={() => (key = nanoid())}>
							{$i18n.document.field_doc_id_btn_auto_id}
						</button>
					</div>
				</div>
				{#each fields as field, i (i)}
					<DocFormField
						bind:name={field.name}
						bind:fieldType={field.fieldType}
						bind:value={field.value}
						isShowDeleteButton={fields.length > 1}
						onDeleteFieldPressed={() => onDeleteFieldPressed(i)}
					/>
				{/each}

				<button class="text action start" type="button" on:click={onAddFieldButtonPressed}>
					<IconNew size="16px" />
					<span>{$i18n.document.btn_add_field}</span>
				</button>
			</div>

			<div class="button-wrapper">
				<button type="submit" class="primary" disabled={!isFormValid}>Submit</button>
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
		flex-direction: row;
		align-items: center;
		gap: var(--padding-2x);
		margin-bottom: var(--padding-2x);

		input {
			display: flex;
			flex: 0.9;
		}

		button {
			flex: 0.1;
		}
	}
</style>
