<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { uploadFile } from '@junobuild/core';
	import { getContext, type Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import DataUpload from '$lib/components/data/DataUpload.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { COLLECTION_DAPP } from '$lib/constants/storage.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { container } from '$lib/utils/juno.utils';

	interface Props {
		asset?: AssetNoContent | undefined;
		action?: Snippet;
		title?: Snippet;
		description?: Snippet;
		onfileuploaded: () => void;
	}

	let { asset = undefined, action, title, description, onfileuploaded }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection = $derived($store.rule?.[0]);

	let newFileFullPath = $state<string | undefined>(undefined);

	let satelliteId: Principal = $derived($store.satelliteId);

	const upload = async (file: File | undefined) => {
		if (isNullish(file)) {
			// Upload is disabled if not valid
			toasts.error({
				text: $i18n.errors.no_file_selected_for_upload
			});
			return;
		}

		if (isNullish(collection)) {
			toasts.error({
				text: $i18n.errors.no_collection_for_upload
			});
			return;
		}

		if (isNullish($authStore.identity)) {
			toasts.error({
				text: $i18n.authentication.not_signed_in
			});
			return;
		}

		if (notEmptyString(newFileFullPath)) {
			if (!newFileFullPath.startsWith('/')) {
				toasts.error({
					text: $i18n.errors.full_path_start_slash
				});
				return;
			}

			if (newFileFullPath.endsWith('/')) {
				toasts.error({
					text: $i18n.errors.full_path_end_slash
				});
				return;
			}
		}

		busy.start();

		try {
			await uploadFile({
				...(nonNullish(asset) && {
					filename: asset.key.name,
					fullPath: asset.key.full_path,
					description: fromNullable(asset.key.description),
					token: fromNullable(asset.key.token)
				}),
				...(notEmptyString(newFileFullPath) && {
					fullPath: newFileFullPath
				}),
				collection,
				data: file,
				satellite: {
					satelliteId: satelliteId.toText(),
					identity: $authStore.identity,
					...container()
				}
			});

			onfileuploaded();

			close();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upload_error,
				detail: err
			});
		}

		busy.stop();
	};

	const onfilechange = (file: File | undefined) => {
		// If the asset exist, the full path cannot be edited
		if (nonNullish(asset)) {
			newFileFullPath = undefined;
			return;
		}

		if (isNullish(file)) {
			newFileFullPath = undefined;
			return;
		}

		// The IC certification does not currently support encoding
		const filename = decodeURI(file.name);
		newFileFullPath = `${collection !== COLLECTION_DAPP ? `/${collection}` : ''}/${filename}`;
	};
</script>

<DataUpload {action} {description} {onfilechange} {title} uploadFile={upload}>
	{#snippet confirm()}
		{$i18n.asset.upload}
	{/snippet}

	{#if nonNullish(newFileFullPath)}
		<div in:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}>
			<Value ref="full-path">
				{#snippet label()}
					{$i18n.asset.full_path}
				{/snippet}

				<input
					id="full-path"
					autocomplete="off"
					data-1p-ignore
					placeholder={$i18n.asset.full_path_description}
					type="text"
					bind:value={newFileFullPath}
				/>
			</Value>
		</div>
	{/if}
</DataUpload>
