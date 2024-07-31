<script lang="ts">
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { uploadFile } from '@junobuild/core-peer';
	import { container } from '$lib/utils/juno.utils';
	import { authStore } from '$lib/stores/auth.store';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import DataUpload from '$lib/components/data/DataUpload.svelte';

	export let asset: AssetNoContent | undefined = undefined;

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let visible: boolean | undefined;
	const close = () => (visible = false);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let satelliteId: Principal;
	$: satelliteId = $store.satelliteId;

	const dispatch = createEventDispatcher();

	const upload = async ({ detail: file }: CustomEvent<File | undefined>) => {
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

			dispatch('junoUploaded');

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

<DataUpload on:junoUpload={upload}>
	<slot name="action" slot="action" />
	<slot name="title" slot="title" />
	<slot slot="description" />
</DataUpload>
