<script lang="ts">
	import type { MemoryText, PermissionText } from '$lib/constants/rules.constants';
	import { setRule } from '$lib/api/satellites.api';
	import type { Rule, RulesType } from '$declarations/satellite/satellite.did';
	import { createEventDispatcher, getContext } from 'svelte';
	import { busy } from '$lib/stores/busy.store';
	import { memoryToText, permissionToText } from '$lib/utils/rules.utils';
	import { MemoryHeap, MemoryStable, PermissionManaged } from '$lib/constants/rules.constants';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { toasts } from '$lib/stores/toasts.store';
	import { fromNullable } from '@dfinity/utils';
	import Input from '$lib/components/ui/Input.svelte';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import CollectionDelete from '$lib/components/collections/CollectionDelete.svelte';
	import { authStore } from '$lib/stores/auth.store';

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	export let type: RulesType;

	let typeStorage = false;
	$: typeStorage = 'Storage' in type;

	let typeDatastore = false;
	$: typeDatastore = 'Db' in type;

	let collection: string;
	const initCollection = (initialCollection: string) => (collection = initialCollection);
	$: initCollection($store.rule?.[0] ?? '');

	let rule: Rule | undefined;
	const initRule = (initialRule: Rule | undefined) => (rule = initialRule);
	$: initRule($store.rule?.[1] ?? undefined);

	let read: PermissionText;
	const initRead = (text: PermissionText) => (read = text);
	$: initRead(permissionToText(rule?.read ?? PermissionManaged));

	let write: PermissionText;
	const initWrite = (text: PermissionText) => (write = text);
	$: initWrite(permissionToText(rule?.write ?? PermissionManaged));

	let memory: MemoryText;
	const initMemory = (text: MemoryText) => (memory = text);
	$: initMemory(
		// Before the introduction of the stable memory, the memory used was "Heap". That's why we fallback for display purpose on Stable only if new to support old satellites
		memoryToText(fromNullable(rule?.memory ?? []) ?? (mode === 'new' ? MemoryStable : MemoryHeap))
	);

	let currentImmutable: boolean;
	let immutable: boolean;
	const initMutable = (initialRule: Rule | undefined) => {
		currentImmutable = !(fromNullable(initialRule?.mutable_permissions ?? []) ?? true);
		immutable = currentImmutable;
	};
	$: initMutable($store.rule?.[1] ?? undefined);

	let maxSize: number | undefined;
	const initMaxSize = (size: [] | [bigint]) => {
		const tmp = fromNullable(size);
		maxSize = nonNullish(tmp) ? Number(tmp) : undefined;
	};
	$: initMaxSize(rule?.max_size ?? []);

	let maxCapacity: number | undefined;
	const initMaxCapacity = (capacity: [] | [number]) => {
		maxCapacity = fromNullable(capacity);
	};
	$: initMaxCapacity(rule?.max_capacity ?? []);

	let mode: 'new' | 'edit';
	$: mode = rule !== undefined ? 'edit' : 'new';

	const dispatch = createEventDispatcher();

	const onSubmit = async () => {
		busy.start();

		try {
			await setRule({
				satelliteId: $store.satelliteId,
				collection,
				read,
				write,
				memory,
				type,
				rule,
				maxSize,
				maxCapacity,
				mutablePermissions: !immutable,
				identity: $authStore.identity
			});

			toasts.success(
				i18nFormat(isNullish(rule) ? $i18n.collections.added : $i18n.collections.updated, [
					{
						placeholder: '{0}',
						value: collection
					}
				])
			);

			await reload();

			dispatch('junoCollectionSuccess');
		} catch (err: unknown) {
			toasts.error({
				text: i18nFormat(
					isNullish(rule) ? $i18n.errors.collection_added : $i18n.errors.collection_updated,
					[
						{
							placeholder: '{0}',
							value: collection
						}
					]
				),
				detail: err
			});
		}

		busy.stop();
	};

	let disabled = false;
	$: disabled = isNullish(collection) || collection === '';
</script>

<article>
	<form on:submit|preventDefault={onSubmit}>
		<div>
			<Value ref="collection">
				<svelte:fragment slot="label">{$i18n.collections.key}</svelte:fragment>
				<input
					id="collection"
					type="text"
					placeholder={$i18n.collections.key_placeholder}
					name="collection"
					bind:value={collection}
					disabled={mode === 'edit'}
				/>
			</Value>
		</div>

		<div>
			<Value ref="read">
				<svelte:fragment slot="label">{$i18n.collections.read_permission}</svelte:fragment>
				<select id="read" name="read" bind:value={read} disabled={currentImmutable}>
					<option value="Public">{$i18n.collections.public}</option>
					<option value="Private">{$i18n.collections.private}</option>
					<option value="Managed">{$i18n.collections.managed}</option>
					<option value="Controllers">{$i18n.collections.controllers}</option>
				</select>
			</Value>
		</div>

		<div>
			<Value ref="write">
				<svelte:fragment slot="label">{$i18n.collections.write_permission}</svelte:fragment>
				<select id="write" name="write" bind:value={write} disabled={currentImmutable}>
					<option value="Public">{$i18n.collections.public}</option>
					<option value="Private">{$i18n.collections.private}</option>
					<option value="Managed">{$i18n.collections.managed}</option>
					<option value="Controllers">{$i18n.collections.controllers}</option>
				</select>
			</Value>
		</div>

		<div>
			<Value ref="memory">
				<svelte:fragment slot="label">{$i18n.collections.memory}</svelte:fragment>
				<select id="memory" name="write" bind:value={memory} disabled={mode === 'edit'}>
					<option value="Stable">{$i18n.collections.stable}</option>
					<option value="Heap">{$i18n.collections.heap}</option>
				</select>
			</Value>
		</div>

		{#if typeDatastore}
			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.collections.max_length}</svelte:fragment>
					<Input
						inputType="number"
						placeholder={$i18n.collections.max_length_placeholder}
						name="maxLength"
						required={false}
						bind:value={maxCapacity}
						on:blur={() =>
							(maxCapacity = nonNullish(maxCapacity) ? Math.trunc(maxCapacity) : undefined)}
					/>
				</Value>
			</div>
		{/if}

		{#if typeStorage}
			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.collections.max_size}</svelte:fragment>
					<Input
						inputType="number"
						placeholder={$i18n.collections.max_size_placeholder}
						name="maxSize"
						required={false}
						bind:value={maxSize}
						on:blur={() => (maxSize = nonNullish(maxSize) ? Math.trunc(maxSize) : undefined)}
					/>
				</Value>
			</div>
		{/if}

		{#if !currentImmutable}
			<div class="checkbox">
				<label>
					<input
						type="checkbox"
						checked={immutable}
						disabled={currentImmutable}
						on:change={() => (immutable = !immutable)}
					/>
					<span>{$i18n.collections.immutable}</span>
				</label>
			</div>
		{/if}

		<div class="toolbar">
			<button type="button" on:click={() => dispatch('junoCollectionCancel')}
				>{$i18n.core.cancel}</button
			>

			{#if mode === 'edit'}
				<CollectionDelete {collection} {rule} {type} on:junoCollectionSuccess />
			{/if}

			<button type="submit" class="primary" {disabled}>{$i18n.core.submit}</button>
		</div>
	</form>
</article>

<style lang="scss">
	article {
		padding: 0 var(--padding-2x);
		height: 100%;
	}

	form {
		display: flex;
		flex-direction: column;
		padding: var(--padding-2x) var(--padding);
		gap: var(--padding);
	}

	.toolbar {
		display: flex;
		align-items: center;
		margin: var(--padding-2x) 0 0;
		gap: var(--padding-2x);
	}

	.checkbox {
		margin: var(--padding-0_5x) 0 0;
	}
</style>
