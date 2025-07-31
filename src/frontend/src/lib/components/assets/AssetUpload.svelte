<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { uploadFile } from '@junobuild/core';
	import { getContext, type Snippet } from 'svelte';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import DataUpload from '$lib/components/data/DataUpload.svelte';
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

	let collection: string | undefined = $derived($store.rule?.[0]);

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

		busy.start();

		try {
			await uploadFile({
				...(nonNullish(asset) && {
					filename: asset.key.name,
					fullPath: asset.key.full_path,
					description: fromNullable(asset.key.description),
					token: fromNullable(asset.key.token)
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
</script>

<DataUpload {action} {description} {title} uploadFile={upload}>
	{#snippet confirm()}
		{$i18n.asset.upload}
	{/snippet}
</DataUpload>
