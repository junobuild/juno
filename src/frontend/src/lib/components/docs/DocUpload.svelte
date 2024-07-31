<script lang="ts">
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { getContext } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import DataUpload from '$lib/components/data/DataUpload.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import { nanoid } from 'nanoid';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let visible: boolean | undefined;
	const close = () => (visible = false);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let satelliteId: Principal;
	$: satelliteId = $store.satelliteId;

	let key: string | undefined;
	let description: string | undefined;

	const generateKey = () => (key = nanoid());

	const upload = async ({ detail: file }: CustomEvent<File | undefined>) => {};
</script>

<DataUpload on:junoUpload={upload}>
	<slot name="action" slot="action" />
	<slot name="title" slot="title" />
	<slot slot="description" />

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
					<IconAutoRenew />
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
