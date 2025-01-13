<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { setDoc } from '@junobuild/core';
	import { nanoid } from 'nanoid';
	import { createEventDispatcher, getContext, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import type { Doc } from '$declarations/satellite/satellite.did';
	import DataUpload from '$lib/components/data/DataUpload.svelte';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { fromNullishNullable } from '$lib/utils/did.utils';
	import { fileToDocData } from '$lib/utils/doc.utils';
	import { container } from '$lib/utils/juno.utils';

	interface Props {
		docKey?: string | undefined;
		doc?: Doc | undefined;
		action?: Snippet;
		title?: Snippet;
		description?: Snippet;
	}

	let {
		docKey = undefined,
		doc = undefined,
		action,
		title,
		description: descriptionSnippet
	}: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined = $derived($store.rule?.[0]);

	let satelliteId: Principal = $derived($store.satelliteId);

	let key: string | undefined = $state();
	const initKey = (k: string | undefined) => (key = k);
	run(() => {
		initKey(docKey);
	});

	let description: string | undefined = $state();
	const initDescription = (d: string | undefined) => (description = d);
	run(() => {
		initDescription(fromNullishNullable(doc?.description));
	});

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
					...(nonNullish(doc) && { version: fromNullishNullable(doc?.version) })
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

	let mode: 'create' | 'replace' = $state('create');
	run(() => {
		mode = nonNullish(doc) && nonNullish(docKey) ? 'replace' : 'create';
	});
</script>

<DataUpload
	on:junoUpload={upload}
	disabled={!notEmptyString(key)}
	{action}
	{title}
	description={descriptionSnippet}
>
	{#if mode === 'create'}
		<div>
			<Value ref="doc-key">
				{#snippet label()}
					{$i18n.document.key}
				{/snippet}
				<div class="form-doc-key">
					<input
						id="doc-key"
						type="text"
						placeholder={$i18n.document.key_placeholder}
						bind:value={key}
						autocomplete="off"
						data-1p-ignore
					/>
					<button
						class="text"
						type="button"
						onclick={generateKey}
						aria-label={$i18n.document.key_generate}
					>
						<IconAutoRenew size="20px" />
					</button>
				</div>
			</Value>
		</div>

		<div>
			<Value ref="doc-description">
				{#snippet label()}
					{$i18n.document.description}
				{/snippet}
				<input
					id="doc-description"
					type="text"
					placeholder={$i18n.document.description_placeholder}
					bind:value={description}
					autocomplete="off"
					data-1p-ignore
				/>
			</Value>
		</div>
	{/if}

	{#snippet confirm()}
		{mode === 'replace' ? $i18n.core.replace : $i18n.core.create}
	{/snippet}
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
