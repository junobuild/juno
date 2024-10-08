<script lang="ts">
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import DataUpload from '$lib/components/data/DataUpload.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import { nanoid } from 'nanoid';
	import { fromNullable, isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { setDoc } from '@junobuild/core-peer';
	import { container } from '$lib/utils/juno.utils';
	import { fileToDocData } from '$lib/utils/doc.utils';
	import type { Doc } from '$declarations/satellite/satellite.did';

	export let docKey: string | undefined = undefined;
	export let doc: Doc | undefined = undefined;

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let satelliteId: Principal;
	$: satelliteId = $store.satelliteId;

	let key: string | undefined;
	const initKey = (k: string | undefined) => (key = k);
	$: initKey(docKey);

	let description: string | undefined;
	const initDescription = (d: string | undefined) => (description = d);
	$: initDescription(fromNullable(doc?.description ?? []));

	const generateKey = () => (key = nanoid());

	const dispatch = createEventDispatcher();

	const upload = async ({ detail: file }: CustomEvent<File | undefined>) => {
		if (isNullish(file)) {
			// Upload is disabled if not valid
			toasts.error({
				text: $i18n.errors.no_file_selected_for_upload
			});
			return;
		}

		if (isNullish(key) || !notEmptyString(key)) {
			// Upload is disabled if not valid
			toasts.error({
				text: $i18n.errors.key_invalid
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
			await setDoc({
				collection,
				doc: {
					key,
					...(notEmptyString(description) && { description }),
					data: await fileToDocData(file),
					...(nonNullish(doc) && { version: fromNullable(doc?.version ?? []) })
				},
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

	let mode: 'create' | 'replace' = 'create';
	$: mode = nonNullish(doc) && nonNullish(docKey) ? 'replace' : 'create';
</script>

<DataUpload on:junoUpload={upload} disabled={!notEmptyString(key)}>
	<slot name="action" slot="action" />
	<slot name="title" slot="title" />
	<slot slot="description" />

	{#if mode === 'create'}
		<div>
			<Value ref="doc-key">
				<svelte:fragment slot="label">{$i18n.document.key}</svelte:fragment>
				<div class="form-doc-key">
					<input
						id="doc-key"
						type="text"
						placeholder={$i18n.document.key_placeholder}
						bind:value={key}
					/>
					<button
						class="text"
						type="button"
						on:click={generateKey}
						aria-label={$i18n.document.key_generate}
					>
						<IconAutoRenew size="20px" />
					</button>
				</div>
			</Value>
		</div>

		<div>
			<Value ref="doc-description">
				<svelte:fragment slot="label">{$i18n.document.description}</svelte:fragment>
				<input
					id="doc-description"
					type="text"
					placeholder={$i18n.document.description_placeholder}
					bind:value={description}
				/>
			</Value>
		</div>
	{/if}

	<svelte:fragment slot="confirm"
		>{mode === 'replace' ? $i18n.document.replace : $i18n.document.create}</svelte:fragment
	>
</DataUpload>

<style lang="scss">
	.form-doc-key {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);

		button {
			margin: var(--padding) 0 var(--padding-2x);
		}
	}
</style>
