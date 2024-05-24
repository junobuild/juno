<script lang="ts">
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import IconUpload from '$lib/components/icons/IconUpload.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { isNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { uploadFile } from '@junobuild/core-peer';
	import { container } from '$lib/utils/juno.utils';
	import { authStore } from '$lib/stores/auth.store';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let visible: boolean | undefined;
	const close = () => (visible = false);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let satelliteId: Principal;
	$: satelliteId = $store.satelliteId;

	let file: File | undefined = undefined;

	const onChangeFile = ($event: Event) =>
		(file = ($event as unknown as { target: EventTarget & HTMLInputElement }).target?.files?.[0]);

	let disableUpload = true;
	$: disableUpload = isNullish(file) || $isBusy;

	const dispatch = createEventDispatcher();

	const upload = async () => {
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

<button class="menu" type="button" on:click={() => (visible = true)}
	><IconUpload size="20px" /> <slot name="action" /></button
>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3><slot name="title" /></h3>

		<p><slot /></p>

		<input type="file" on:change={onChangeFile} disabled={$isBusy} />

		<div>
			<button type="button" on:click|stopPropagation={close} disabled={$isBusy}>
				{$i18n.core.cancel}
			</button>

			<button type="button" on:click|stopPropagation={upload} disabled={$isBusy}>
				{$i18n.asset.upload}
			</button>
		</div>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
		max-width: 100%;
	}

	h3 {
		margin-bottom: var(--padding-2x);
	}

	p {
		white-space: initial;
		word-break: break-word;
	}
</style>
