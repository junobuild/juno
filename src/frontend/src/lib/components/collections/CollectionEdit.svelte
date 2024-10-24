<script lang="ts">
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher, getContext } from 'svelte';
	import { run, preventDefault } from 'svelte/legacy';
	import type { Rule, RulesType } from '$declarations/satellite/satellite.did';
	import { setRule } from '$lib/api/satellites.api';
	import CollectionDelete from '$lib/components/collections/CollectionDelete.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		MemoryHeap,
		MemoryStable,
		PermissionManaged,
		type MemoryText,
		type PermissionText
	} from '$lib/constants/rules.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { memoryToText, permissionToText } from '$lib/utils/rules.utils';

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	interface Props {
		type: RulesType;
	}

	let { type }: Props = $props();

	let typeStorage = $state(false);

	let typeDatastore = $state(false);

	let collection: string = $state();
	const initCollection = (initialCollection: string) => (collection = initialCollection);

	let rule: Rule | undefined = $state();
	const initRule = (initialRule: Rule | undefined) => (rule = initialRule);

	let read: PermissionText = $state();
	const initRead = (text: PermissionText) => (read = text);

	let write: PermissionText = $state();
	const initWrite = (text: PermissionText) => (write = text);

	let memory: MemoryText = $state();
	const initMemory = (text: MemoryText) => (memory = text);

	let currentImmutable: boolean = $state();
	let immutable: boolean = $state();
	const initMutable = (initialRule: Rule | undefined) => {
		currentImmutable = !(fromNullable(initialRule?.mutable_permissions ?? []) ?? true);
		immutable = currentImmutable;
	};

	let maxSize: number | undefined = $state();
	const initMaxSize = (size: [] | [bigint]) => {
		const tmp = fromNullable(size);
		maxSize = nonNullish(tmp) ? Number(tmp) : undefined;
	};

	let maxCapacity: number | undefined = $state();
	const initMaxCapacity = (capacity: [] | [number]) => {
		maxCapacity = fromNullable(capacity);
	};

	let mode: 'new' | 'edit' = $state();

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

	let disabled = $state(false);
	run(() => {
		typeStorage = 'Storage' in type;
	});
	run(() => {
		typeDatastore = 'Db' in type;
	});
	run(() => {
		initCollection($store.rule?.[0] ?? '');
	});
	run(() => {
		initRule($store.rule?.[1] ?? undefined);
	});
	run(() => {
		initRead(permissionToText(rule?.read ?? PermissionManaged));
	});
	run(() => {
		initWrite(permissionToText(rule?.write ?? PermissionManaged));
	});
	run(() => {
		mode = rule !== undefined ? 'edit' : 'new';
	});
	run(() => {
		initMemory(
			// Before the introduction of the stable memory, the memory used was "Heap". That's why we fallback for display purpose on Stable only if new to support old satellites
			memoryToText(fromNullable(rule?.memory ?? []) ?? (mode === 'new' ? MemoryStable : MemoryHeap))
		);
	});
	run(() => {
		initMutable($store.rule?.[1] ?? undefined);
	});
	run(() => {
		initMaxSize(rule?.max_size ?? []);
	});
	run(() => {
		initMaxCapacity(rule?.max_capacity ?? []);
	});
	run(() => {
		disabled = isNullish(collection) || collection === '';
	});
</script>

<article>
	<form onsubmit={preventDefault(onSubmit)}>
		<div>
			<Value ref="collection">
				{#snippet label()}
					{$i18n.collections.key}
				{/snippet}
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
				{#snippet label()}
					{$i18n.collections.read_permission}
				{/snippet}
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
				{#snippet label()}
					{$i18n.collections.write_permission}
				{/snippet}
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
				{#snippet label()}
					{$i18n.collections.memory}
				{/snippet}
				<select id="memory" name="write" bind:value={memory} disabled={mode === 'edit'}>
					<option value="Stable">{$i18n.collections.stable}</option>
					<option value="Heap">{$i18n.collections.heap}</option>
				</select>
			</Value>
		</div>

		{#if typeDatastore}
			<div>
				<Value>
					{#snippet label()}
						{$i18n.collections.max_capacity}
					{/snippet}
					<Input
						inputType="number"
						placeholder={$i18n.collections.max_capacity_placeholder}
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
					{#snippet label()}
						{$i18n.collections.max_size}
					{/snippet}
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
						onchange={() => (immutable = !immutable)}
					/>
					<span>{$i18n.collections.immutable}</span>
				</label>
			</div>
		{/if}

		<div class="toolbar">
			<button type="button" onclick={() => dispatch('junoCollectionCancel')}
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
