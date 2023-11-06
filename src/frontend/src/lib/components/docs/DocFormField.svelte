<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { DocFieldTypeEnum } from '$lib/types/doc-form';
	import IconDelete from '../icons/IconDelete.svelte';
	import { createEventDispatcher } from 'svelte';
	import Value from '$lib/components/ui/Value.svelte';

	export let name = '';
	export let fieldType: DocFieldTypeEnum = DocFieldTypeEnum.STRING;
	export let value: string | boolean | number = '';
	export let deleteButton = false;

	const dispatch = createEventDispatcher();
</script>

<div class="form-field">
	<div class="form-field-item">
		<Value ref="field-name">
			<svelte:fragment slot="label">{$i18n.document_form.field_name_label}</svelte:fragment>
			<input
				id="field-name"
				name="field-name"
				type="text"
				placeholder={$i18n.document_form.field_name_placeholder}
				bind:value={name}
			/>
		</Value>
	</div>

	<div class="form-field-item">
		<Value ref="field-type">
			<svelte:fragment slot="label">{$i18n.document_form.field_type_label}</svelte:fragment>
			<select id="field-type" name="field-type" bind:value={fieldType}>
				<option value={DocFieldTypeEnum.BOOLEAN}>{$i18n.document_form.field_type_boolean}</option>
				<option value={DocFieldTypeEnum.STRING}>{$i18n.document_form.field_type_string}</option>
				<option value={DocFieldTypeEnum.NUMBER}>{$i18n.document_form.field_type_number}</option>
			</select>
		</Value>
	</div>

	<div class="form-field-item">
		<Value>
			<svelte:fragment slot="label">{$i18n.document_form.field_value_label}</svelte:fragment>

			<div class="value-input-wrapper">
				{#if fieldType === DocFieldTypeEnum.NUMBER || fieldType === DocFieldTypeEnum.STRING}
					<input
						type={fieldType === DocFieldTypeEnum.STRING ? 'text' : 'number'}
						placeholder={$i18n.document_form.field_value_label}
					/>
				{/if}

				{#if fieldType === DocFieldTypeEnum.BOOLEAN}
					<select bind:value>
						<option value={true}>{$i18n.document_form.field_value_true}</option>
						<option value={false}>{$i18n.document_form.field_value_false}</option>
					</select>
				{/if}

				{#if deleteButton}
					<button class="text action start" type="button" on:click={() => dispatch('junoDelete')}>
						<IconDelete size="24px" />
					</button>
				{/if}
			</div>
		</Value>
	</div>
</div>

<style lang="scss">
	.form-field {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding-1_5x);
		margin-bottom: var(--padding-2x);
	}

	.form-field-item {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.value-input-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
