<script lang="ts">
	import { fromNullable, isNullish, nonNullish , fromNullishNullable } from '@dfinity/utils';
	import { type SvelteComponent, createEventDispatcher, getContext } from 'svelte';
	import { preventDefault } from 'svelte/legacy';
	import type { RateConfig, Rule, RulesType } from '$declarations/satellite/satellite.did';
	import CollectionDelete from '$lib/components/collections/CollectionDelete.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		MemoryHeap,
		MemoryStable,
		PermissionManaged,
		type MemoryText,
		type PermissionText
	} from '$lib/constants/rules.constants';
	import { setRule } from '$lib/services/collection.services';
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

	let typeStorage = $derived('Storage' in type);

	let typeDatastore = $derived('Db' in type);

	let collection: string = $state('');
	$effect(() => {
		collection = $store.rule?.[0] ?? '';
	});

	let rule: Rule | undefined = $state(undefined);
	$effect(() => {
		rule = $store.rule?.[1] ?? undefined;
	});

	let mode: 'new' | 'edit' = $derived(nonNullish(rule) ? 'edit' : 'new');

	let read: PermissionText = $state(permissionToText(PermissionManaged));
	$effect(() => {
		read = permissionToText(rule?.read ?? PermissionManaged);
	});

	let write: PermissionText = $state(permissionToText(PermissionManaged));
	$effect(() => {
		write = permissionToText(rule?.write ?? PermissionManaged);
	});

	// Before the introduction of the stable memory, the memory used was "Heap". That's why we fallback for display purpose on Stable only if new to support old satellites
	const initMemory = (rule: Rule | undefined): MemoryText =>
		memoryToText(
			fromNullishNullable(rule?.memory) ?? (isNullish(rule) ? MemoryStable : MemoryHeap)
		);
	let memory: MemoryText = $state(memoryToText(MemoryStable));
	$effect(() => {
		memory = initMemory(rule);
	});

	let currentImmutable: boolean | undefined = $state();
	let immutable: boolean | undefined = $state();
	const initMutable = (initialRule: Rule | undefined) => {
		currentImmutable = !(fromNullishNullable(initialRule?.mutable_permissions) ?? true);
		immutable = currentImmutable;
	};
	$effect(() => initMutable($store.rule?.[1] ?? undefined));

	let maxSize: number | undefined = $state();
	const initMaxSize = (size: [] | [bigint]) => {
		const tmp = fromNullable(size);
		maxSize = nonNullish(tmp) ? Number(tmp) : undefined;
	};
	$effect(() => initMaxSize(rule?.max_size ?? []));

	let maxTokens: number | undefined = $state();
	const initRateTokens = (rate_config: [] | [RateConfig]) => {
		const tmp = fromNullable(rate_config)?.max_tokens;
		maxTokens = nonNullish(tmp) ? Number(tmp) : undefined;
	};
	$effect(() => initRateTokens(rule?.rate_config ?? []));

	let maxCapacity: number | undefined = $state(undefined);
	$effect(() => {
		maxCapacity = fromNullishNullable(rule?.max_capacity);
	});

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
				maxTokens,
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

	let disabled = $derived(isNullish(collection) || collection === '');

	let collapsibleRef: (SvelteComponent & { open: () => void; close: () => void }) | undefined =
		$state(undefined);

	const toggle = (toggleOptions: boolean) => {
		if (!toggleOptions) {
			collapsibleRef?.close();

			return;
		}

		collapsibleRef?.open();
	};

	// TODO: that's ugly but really did not find any other solution to deal with the reactivity of the toggle which ends re-selecting the rule.
	let toggleCollection: string | undefined = $state(undefined);

	$effect(() => {
		const r = $store.rule?.[1] ?? undefined;

		if (toggleCollection === $store.rule?.[0]) {
			return;
		}

		toggleCollection = $store.rule?.[0];

		const toggleOptions =
			nonNullish(fromNullishNullable(r?.max_capacity)) ||
			nonNullish(fromNullishNullable(r?.max_size)) ||
			nonNullish(fromNullishNullable(r?.rate_config)) ||
			fromNullishNullable(r?.mutable_permissions) === false;

		toggle(toggleOptions);
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
					autocomplete="off"
					data-1p-ignore
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

		<Collapsible bind:this={collapsibleRef}>
			<svelte:fragment slot="header">{$i18n.collections.options}</svelte:fragment>

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
							onblur={() =>
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
							onblur={() => (maxSize = nonNullish(maxSize) ? Math.trunc(maxSize) : undefined)}
						/>
					</Value>
				</div>
			{/if}

			<div>
				<Value>
					{#snippet label()}
						{$i18n.collections.rate_limit}
					{/snippet}
					<Input
						inputType="number"
						placeholder={$i18n.collections.rate_limit_placeholder}
						name="maxTokens"
						required={false}
						bind:value={maxTokens}
						onblur={() => (maxTokens = nonNullish(maxTokens) ? Math.trunc(maxTokens) : undefined)}
					/>
				</Value>
			</div>

			{#if !currentImmutable}
				<Checkbox>
					<label class="immutable">
						<input
							type="checkbox"
							checked={immutable}
							disabled={currentImmutable}
							onchange={() => (immutable = !immutable)}
						/>
						<span>{$i18n.collections.immutable}</span>
					</label>
				</Checkbox>
			{/if}
		</Collapsible>

		<div class="toolbar">
			<button type="button" onclick={() => dispatch('junoCollectionCancel')}
				>{$i18n.core.cancel}</button
			>

			{#if mode === 'edit'}
				<CollectionDelete {collection} {rule} {type} on:junoCollectionSuccess />
			{/if}

			{#if !currentImmutable}
				<button type="submit" class="primary" {disabled}>{$i18n.core.submit}</button>
			{/if}
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

	.immutable {
		margin: var(--padding) 0 0;
	}
</style>
