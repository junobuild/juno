
<script lang="ts">
  import IconNew from '$lib/components/icons/IconNew.svelte';
	import { DocFieldTypeEnum, type DocField } from '$lib/types/doc-form';
	import IconDelete from '../icons/IconDelete.svelte';
  import { busy } from '$lib/stores/busy.store';
  import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import type { Principal } from '@dfinity/principal';
	import { createEventDispatcher, getContext } from 'svelte';
	import { isNullish } from '$lib/utils/utils';
  import { i18n } from '$lib/stores/i18n.store';
	import { nanoid } from 'nanoid';
	import { DATA_CONTEXT_KEY, DataStoreStateEnum, type DataContext } from '$lib/types/data.context';
	import type Doc from './Doc.svelte';

  const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);
  const { store: docsStore }: DataContext<Doc> = getContext<DataContext<Doc>>(DATA_CONTEXT_KEY);


  let state: DataStoreStateEnum | undefined
  $: state = $docsStore.state
  let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let satelliteId: Principal;
	$: satelliteId = $store.satelliteId;

  let key: string = '';
  let fields: DocField[] = [
    {
      name: '',
      fieldType: DocFieldTypeEnum.boolean,
      value: false,
    }
  ]

  const onAddFieldButtonPressed = () => {
    fields = [
      ...fields,
      {
        name: '',
        fieldType: DocFieldTypeEnum.boolean,
        value: false,
      }
    ]
  }

  const onDeleteFieldPressed = (index: number) => {
    if (fields.length > 1) {
      fields = fields.filter((_, i) => i !== index)
    }
  }

  let isFormValid = false
  $: isFormValid = !!key && !!fields.find((field) => !!field.name && !isNullish(field.value) && field.value !== '')

  const dispatch = createEventDispatcher();

  let onSubmit: () => Promise<void>    
  $: onSubmit = async () => {
    if (!isFormValid && !collection) return;

    busy.start();

    try {
      /**
       * TODO:
       * - add setDoc logic
      */

      toasts.success(
				$i18n.document.document_submission_success
			);

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
  }

  let isActive = false
  $: isActive = state === DataStoreStateEnum.CREATE || state === DataStoreStateEnum.EDIT

</script>

<p class="title doc-form">{isActive ? $i18n.document.title_add_new_document : ""}</p>

{#if isActive}
<article class="doc-form">
  <form on:submit|preventDefault={onSubmit}>
    <div>
      <div>
        <label>{$i18n.document.field_doc_id_label}</label>
        <div class="form-doc-id">
          <input
            id="doc-id"
            type="text"
            placeholder="Document ID"
            name="doc_id"
            bind:value={key}
          />
          <button
            class="primary"
            on:click|preventDefault={() => key = nanoid()}
            >
              {$i18n.document.field_doc_id_btn_auto_id}
          </button>
        </div>
      </div>
      {#each fields as field, i (i)}
        <div class="form-field">
          <div class="form-field-item">
            <label>{$i18n.document.field_name_label}</label>
            <input
              id="field_name"
              type="text"
              placeholder={$i18n.document.field_name_placeholder}
              name="field_name"
              bind:value={field.name}
            />
          </div>
          <div class="form-field-item">
            <label>{$i18n.document.field_type_label}</label>
            <select id="field_type" name="field_type" bind:value={field.fieldType}>
              <option value={DocFieldTypeEnum.boolean}>{$i18n.document.field_type_boolean}</option>
              <option value={DocFieldTypeEnum.string}>{$i18n.document.field_type_string}</option>
              <option value={DocFieldTypeEnum.number}>{$i18n.document.field_type_number}</option>
            </select>
          </div>
          <div class="form-field-item">
            <div>
              <label>{$i18n.document.field_value_label}</label>
              <div class="value-input-wrapper">
                {#if field.fieldType === DocFieldTypeEnum.number || field.fieldType === DocFieldTypeEnum.string}
                  <input
                    id="value"
                    type={field.fieldType === DocFieldTypeEnum.string ? "text" : "number"}
                    placeholder={$i18n.document.field_value_label}
                    name="field_value"
                  />
                {/if}

                {#if field.fieldType === DocFieldTypeEnum.boolean} 
                  <select id="field_value" name="field_value" placeholder="Field value" bind:value={field.value}>
                    <option value={true}>{$i18n.document.field_value_true}</option>
                    <option value={false}>{$i18n.document.field_value_false}</option>
                  </select>
                {/if}

                {#if fields.length > 1}
                  <button
                    class="text action start"
                    on:click|preventDefault={() => onDeleteFieldPressed(i)}
                    >
                      <IconDelete size="24px" />
                  </button>
                {/if}
              </div>  
            </div>            
          </div>
        </div>
      {/each}

      <button
        class="text action start"
        on:click|preventDefault={onAddFieldButtonPressed}
      >
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

  .form-field {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    margin-bottom: var(--padding-2x);
  }

  .form-field-item {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .button-wrapper {
    margin-top: var(--padding-2x);
  }

  .value-input-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .checkbox {
    min-width: 5em;
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