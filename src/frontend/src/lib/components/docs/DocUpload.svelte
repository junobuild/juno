<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import {
		isEmptyString,
		isNullish,
		nonNullish,
		notEmptyString,
		fromNullishNullable
	} from '@dfinity/utils';
	import { setDoc } from '@junobuild/core';
	import { nanoid } from 'nanoid';
	import { getContext, type Snippet } from 'svelte';
	import type { SatelliteDid } from '$declarations';
	import DataUpload from '$lib/components/data/DataUpload.svelte';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { fileToDocData } from '$lib/utils/doc.utils';
	import { container } from '$lib/utils/juno.utils';

	interface Props {
		docKey?: string | undefined;
		doc?: SatelliteDid.Doc | undefined;
		action?: Snippet;
		title?: Snippet;
		description?: Snippet;
		onfileuploaded: () => void;
	}

	let {
		docKey = undefined,
		doc = undefined,
		action,
		title,
		description: descriptionSnippet,
		onfileuploaded
	}: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined = $derived($store.rule?.[0]);

	let satelliteId: Principal = $derived($store.satelliteId);

	let key = $state<string | undefined>();
	const initKey = (k: string | undefined) => (key = k);
	$effect(() => {
		initKey(docKey);
	});

	let description = $state<string | undefined>();
	const initDescription = (d: string | undefined) => (description = d);
	$effect(() => {
		initDescription(fromNullishNullable(doc?.description));
	});

	const generateKey = () => (key = nanoid());

	const upload = async (file: File | undefined) => {
		if (isNullish(file)) {
			// Upload is disabled if not valid
			toasts.error({
				text: $i18n.errors.no_file_selected_for_upload
			});
			return;
		}

		if (isNullish(key) || isEmptyString(key)) {
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

	let mode = $derived(nonNullish(doc) && nonNullish(docKey) ? 'replace' : 'create');
</script>

<DataUpload
	{action}
	description={descriptionSnippet}
	disabled={isEmptyString(key)}
	{title}
	uploadFile={upload}
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
						autocomplete="off"
						data-1p-ignore
						placeholder={$i18n.document.key_placeholder}
						type="text"
						bind:value={key}
					/>
					<button
						class="text"
						aria-label={$i18n.document.key_generate}
						onclick={generateKey}
						type="button"
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
					autocomplete="off"
					data-1p-ignore
					placeholder={$i18n.document.description_placeholder}
					type="text"
					bind:value={description}
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
