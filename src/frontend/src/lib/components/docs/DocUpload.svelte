<script lang="ts">
	import {
		isEmptyString,
		isNullish,
		nonNullish,
		notEmptyString,
		fromNullishNullable
	} from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { setDoc } from '@junobuild/core';
	import { nanoid } from 'nanoid';
	import { getContext, type Snippet } from 'svelte';
	import type { SatelliteDid } from '$declarations';
	import DataUpload from '$lib/components/data/DataUpload.svelte';
	import InputGenerate from '$lib/components/ui/InputGenerate.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
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

		if (isNullish($authIdentity)) {
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
					identity: $authIdentity,
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

				<InputGenerate
					generate={generateKey}
					generateLabel={$i18n.document.key_generate}
					inputPlaceholder={$i18n.document.key_placeholder}
					bind:inputValue={key}
				/>
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
