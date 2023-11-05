
<script lang="ts">
  import IconNew from '$lib/components/icons/IconNew.svelte';
	import { DocFieldTypeEnum, type DocField } from '$lib/types/doc-form';
	import IconDelete from '../icons/IconDelete.svelte';
  import { busy } from '$lib/stores/busy.store';
	import { setDoc } from '$lib/api/satellites.api';
  import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import type { Principal } from '@dfinity/principal';
	import { createEventDispatcher, getContext } from 'svelte';
	import { generateUniqueDocID } from '$lib/utils/doc.utils';
	import { isNullish } from '$lib/utils/utils';
  import { i18n } from '$lib/stores/i18n.store';
	import { toArray, toNullable } from '$lib/utils/did.utils';

  const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

  let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let satelliteId: Principal;
	$: satelliteId = $store.satelliteId;

  let docId: string = '';
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
  $: isFormValid = !!docId && !!fields.find((field) => !!field.name && !isNullish(field.value) && field.value !== '')

  const dispatch = createEventDispatcher();

  let onSubmit: () => Promise<void>    
  $: onSubmit = async () => {
    if (!isFormValid && !collection) return;

    busy.start();

    try {
      const doc: Record<string, string | number | boolean> = {}
      fields.forEach((field) => {
        doc[field.name] = field.value
      })
      
      const docArray = await toArray(doc)

      await setDoc({
        satelliteId,
        collection: collection as string,
        key: docId,
        doc: {
          data: docArray,
          description: toNullable(),
          updated_at: toNullable(BigInt(new Date().getUTCMilliseconds())),
        },
      })

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

</script>

<p class="title doc">Create New Document</p>

<article>
  <form on:submit|preventDefault={onSubmit}>
    <div>
      <div>
        <label>Doc ID</label>
        <div class="form-doc-id">
          <input
            id="doc-id"
            type="text"
            placeholder="Document ID"
            name="doc_id"
            bind:value={docId}
          />
          <button
            class="primary"
            on:click|preventDefault={() => docId = generateUniqueDocID()}
            >
              Auto ID
          </button>
        </div>
      </div>
      {#each fields as field, i (i)}
        <div class="form-field">
          <div class="form-field-item">
            <label>Field</label>
            <input
              id="field_name"
              type="text"
              placeholder="Field name"
              name="field_name"
              bind:value={field.name}
            />
          </div>
          <div class="form-field-item">
            <label>Type</label>
            <select id="field_type" name="field_type" bind:value={field.fieldType}>
              <option value={DocFieldTypeEnum.boolean}>Boolean</option>
              <option value={DocFieldTypeEnum.string}>String</option>
              <option value={DocFieldTypeEnum.number}>Number</option>
            </select>
          </div>
          <div class="form-field-item">
            <div>
              <label>Value</label>
              <div class="value-input-wrapper">
                {#if field.fieldType === DocFieldTypeEnum.number || field.fieldType === DocFieldTypeEnum.string}
                  <input
                    id="value"
                    type={field.fieldType === DocFieldTypeEnum.string ? "text" : "number"}
                    placeholder="Field value"
                    name="field_value"
                  />
                {/if}

                {#if field.fieldType === DocFieldTypeEnum.boolean} 
                  <select id="field_value" name="field_value" placeholder="Field value" bind:value={field.value}>
                    <option value={true}>True</option>
                    <option value={false}>False</option>
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
        <span>Add Field</span>
      </button>
    </div>

    <div class="button-wrapper">
      <button type="submit" class="primary" disabled={!isFormValid}>Submit</button>
    </div>
  </form>
</article>

<style lang="scss">
	@use '../../styles/mixins/collections';
	@use '../../styles/mixins/media';

  article {
		padding: var(--padding-3x);
		height: 100%;
    grid-column-start: 3;
    grid-column-end: 5;
	}

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
      flex: 0.8;
    }

    button {
      flex: 0.2;
    }
  }
</style>