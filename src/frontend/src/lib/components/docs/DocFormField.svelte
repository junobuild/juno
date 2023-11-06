<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { DocFieldTypeEnum } from '$lib/types/doc-form';
	import IconDelete from '../icons/IconDelete.svelte';

	export let name: string = '';
	export let fieldType: DocFieldTypeEnum = DocFieldTypeEnum.STRING;
	export let value: string | boolean | number = '';
	export let isShowDeleteButton: boolean = false;
	export let onDeleteFieldPressed = () => {};
</script>

<div class="form-field">
	<div class="form-field-item">
		<label>{$i18n.document.field_name_label}</label>
		<input
			id="field_name"
			type="text"
			placeholder={$i18n.document.field_name_placeholder}
			name="field_name"
			bind:value={name}
		/>
	</div>
	<div class="form-field-item">
		<label>{$i18n.document.field_type_label}</label>
		<select id="field_type" name="field_type" bind:value={fieldType}>
			<option value={DocFieldTypeEnum.BOOLEAN}>{$i18n.document.field_type_boolean}</option>
			<option value={DocFieldTypeEnum.STRING}>{$i18n.document.field_type_string}</option>
			<option value={DocFieldTypeEnum.NUMBER}>{$i18n.document.field_type_number}</option>
		</select>
	</div>
	<div class="form-field-item">
		<div>
			<label>{$i18n.document.field_value_label}</label>
			<div class="value-input-wrapper">
				{#if fieldType === DocFieldTypeEnum.NUMBER || fieldType === DocFieldTypeEnum.STRING}
					<input
						id="value"
						type={fieldType === DocFieldTypeEnum.STRING ? 'text' : 'number'}
						placeholder={$i18n.document.field_value_label}
						name="field_value"
					/>
				{/if}

				{#if fieldType === DocFieldTypeEnum.BOOLEAN}
					<select id="field_value" name="field_value" placeholder="Field value" bind:value>
						<option value={true}>{$i18n.document.field_value_true}</option>
						<option value={false}>{$i18n.document.field_value_false}</option>
					</select>
				{/if}

				{#if isShowDeleteButton}
					<button class="text action start" type="button" on:click={() => onDeleteFieldPressed()}>
						<IconDelete size="24px" />
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
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

	.value-input-wrapper {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
</style>
