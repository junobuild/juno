<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import {
		type SetMetadataParams,
		type SetMetadataResult,
		setSatelliteMetadata
	} from '$lib/services/metadata.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { MetadataUi, MetadataUiTags } from '$lib/types/metadata';
	import type { Satellite } from '$lib/types/satellite';
	import {
		metadataUiEnvironment,
		metadataUiName,
		metadataUiTags
	} from '$lib/utils/metadata-ui.utils';
	import type { SegmentWithMetadata } from '$lib/types/segment';

	interface Props {
		segment: SegmentWithMetadata;
		updateMetadata: (params: SetMetadataParams) => Promise<SetMetadataResult>;
	}

	let { segment, updateMetadata }: Props = $props();

	// svelte-ignore state_referenced_locally
	let segmentName = $state(metadataUiName(segment));
	// svelte-ignore state_referenced_locally
	let segmentEnv = $state<string | undefined>(metadataUiEnvironment(segment));

	// svelte-ignore state_referenced_locally
	let segmentTagsInput = $state(metadataUiTags(segment)?.join(',') ?? '');
	let segmentTags = $derived<MetadataUiTags>(
		segmentTagsInput
			.split(/[\n,]+/)
			.map((input) => input.toLowerCase().trim())
			.filter(notEmptyString)
	);

	let visible = $state(false);

	let validConfirm = $derived(nonNullish(segmentName) && segmentName !== '');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.segment_name_missing
			});
			return;
		}

		busy.start();

		const { success } = await updateMetadata({
			missionControlId: $missionControlId,
			identity: $authIdentity,
			metadata: {
				name: segmentName,
				environment: segmentEnv,
				tags: segmentTags
			}
		});

		if (success) {
			visible = false;
		}

		busy.stop();
	};

	const open = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		visible = true;
	};
</script>

<button class="menu" onclick={open}><IconEdit /> {$i18n.core.edit_details}</button>

<Popover backdrop="dark" center bind:visible>
	<form class="container" onsubmit={handleSubmit}>
		<Value ref="segmentName">
			{#snippet label()}
				{$i18n.core.name}
			{/snippet}

			<input
				id="segmentName"
				autocomplete="off"
				data-1p-ignore
				disabled={$isBusy}
				maxlength={64}
				placeholder={$i18n.core.edit_details}
				type="text"
				bind:value={segmentName}
			/>
		</Value>

		<Value ref="segmentEnv">
			{#snippet label()}
				{$i18n.core.environment}
			{/snippet}

			<select id="segmentEnv" disabled={$isBusy} bind:value={segmentEnv}>
				<option value={undefined}>{$i18n.core.unspecified}</option>
				<option value="production"> {$i18n.core.production} </option>
				<option value="staging"> {$i18n.core.staging} </option>
				<option value="test"> {$i18n.core.test} </option>
			</select>
		</Value>

		<Value ref="segmentTags">
			{#snippet label()}
				{$i18n.core.tags}
			{/snippet}

			<textarea placeholder={$i18n.core.tags_placeholder} rows="5" bind:value={segmentTagsInput}
			></textarea>
		</Value>

		<button class="submit" disabled={$isBusy || !validConfirm} type="submit">
			{$i18n.core.apply}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../../styles/mixins/dialog';

	@include dialog.edit;
</style>
