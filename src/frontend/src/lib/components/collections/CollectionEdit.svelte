<script lang="ts">
	import { fromNullable, isNullish, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { type SvelteComponent, getContext } from 'svelte';
	import type { RateConfig, Rule, CollectionType } from '$declarations/satellite/satellite.did';
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
		type: CollectionType;
		oncancel: () => void;
		onsuccess: () => void;
	}

	let { type, oncancel, onsuccess }: Props = $props();

	let typeStorage = $derived('Storage' in type);

	let typeDatastore = $derived('Db' in type);

	// eslint-disable-next-line svelte/prefer-writable-derived
	let collection: string = $state('');
	$effect(() => {
		collection = $store.rule?.[0] ?? '';
	});

	// eslint-disable-next-line svelte/prefer-writable-derived
	let rule: Rule | undefined = $state(undefined);
	$effect(() => {
		rule = $store.rule?.[1] ?? undefined;
	});

	let mode: 'new' | 'edit' = $derived(nonNullish(rule) ? 'edit' : 'new');

	// eslint-disable-next-line svelte/prefer-writable-derived
	let read: PermissionText = $state(permissionToText(PermissionManaged));
	$effect(() => {
		read = permissionToText(rule?.read ?? PermissionManaged);
	});

	// eslint-disable-next-line svelte/prefer-writable-derived
	let write: PermissionText = $state(permissionToText(PermissionManaged));
	$effect(() => {
		write = permissionToText(rule?.write ?? PermissionManaged);
	});

	// Before the introduction of the stable memory, the memory used was "Heap". That's why we fallback for display purpose on Stable only if new to support old satellites
	const initMemory = (rule: Rule | undefined): MemoryText =>
		memoryToText(
			fromNullishNullable(rule?.memory) ?? (isNullish(rule) ? MemoryStable : MemoryHeap)
		);
	// eslint-disable-next-line svelte/prefer-writable-derived
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

	// eslint-disable-next-line svelte/prefer-writable-derived
	let maxCapacity: number | undefined = $state(undefined);
	$effect(() => {
		maxCapacity = fromNullishNullable(rule?.max_capacity);
	});

	// eslint-disable-next-line svelte/prefer-writable-derived
	let maxChanges: number | undefined = $state(undefined);
	$effect(() => {
		maxChanges = fromNullishNullable(rule?.max_changes_per_user);
	});

	// Holds the current value for the 'Max Documents per User' input field.
	// It's undefined if not set.
	let maxDocsPerUser: number | undefined = $state(undefined);
	// Holds the current state of the 'Allow controllers to bypass max docs limit' checkbox.
	// Defaults to false.
	let controllerBypassMaxDocs: boolean = $state(false);
	// Reactive effect to initialize and update `maxDocsPerUser` whenever the `rule` prop changes.
	// `fromNullishNullable` converts the `opt nat32` from the rule (which might be null or undefined in JS)
	// into a number or undefined for the input field.
	$effect(() => {
		maxDocsPerUser = fromNullishNullable(rule?.max_docs_per_user);
		// Initialize controllerBypassMaxDocs from the rule.
		// `rule.controller_bypass_max_docs` is `[] | [boolean]` (opt bool from Candid).
		// `?.[0]` accesses the boolean value if present, otherwise `undefined`.
		// `?? false` defaults to false if the option wasn't set or was null.
		controllerBypassMaxDocs = rule?.controller_bypass_max_docs?.[0] ?? false;
	});

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

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
				maxChanges,
				// The current value from the 'maxDocsPerUser' input field is passed here.
				// If it's undefined (e.g., user cleared the input), it will be submitted as such,
				// effectively removing the limit if it was previously set.
				maxDocsPerUser,
				// Pass the boolean state of the controllerBypassMaxDocs checkbox.
				// This will be `true` or `false`.
				controllerBypassMaxDocs,
				mutablePermissions: !immutable,
				identity: $authStore.identity
			});

			toasts.success({
				text: i18nFormat(isNullish(rule) ? $i18n.collections.added : $i18n.collections.updated, [
					{
						placeholder: '{0}',
						value: collection
					}
				])
			});

			await reload({ identity: $authStore.identity });

			onsuccess();
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

		// This condition determines if the "Options" collapsible section should be opened by default
		// when a rule is loaded for editing.
		// It checks if any of the advanced/optional rule settings (including the new max_docs_per_user)
		// have a value or if permissions are set to immutable.
		// If any of these are true, it suggests advanced options are in use, so the section is expanded.
		const toggleOptions =
			nonNullish(fromNullishNullable(r?.max_capacity)) ||
			nonNullish(fromNullishNullable(r?.max_changes_per_user)) ||
			nonNullish(fromNullishNullable(r?.max_docs_per_user)) ||
			// Expand if controller_bypass_max_docs is explicitly set to true.
			// `r.controller_bypass_max_docs?.[0]` accesses the boolean from `[] | [boolean]`.
			(r?.controller_bypass_max_docs?.[0] === true) ||
			nonNullish(fromNullishNullable(r?.max_size)) ||
			nonNullish(fromNullishNullable(r?.rate_config)) ||
			fromNullishNullable(r?.mutable_permissions) === false;

		toggle(toggleOptions);
	});
</script>

<article>
	<form onsubmit={onSubmit}>
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

		<Collapsible bind:this={collapsibleRef}>
			<svelte:fragment slot="header">{$i18n.collections.options}</svelte:fragment>

			<div class="options">
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

				<div>
					<Value>
						{#snippet label()}
							{$i18n.collections.max_changes}
						{/snippet}
						<Input
							inputType="number"
							placeholder={$i18n.collections.max_changes_placeholder}
							name="maxChanges"
							required={false}
							bind:value={maxChanges}
							onblur={() =>
								(maxChanges = nonNullish(maxChanges) ? Math.trunc(maxChanges) : undefined)}
						/>
					</Value>
				</div>

				<!-- This entire section for 'Max Documents per User' is conditionally rendered. -->
				<!-- It only appears if the current collection 'type' is 'Db' (typeDatastore is true), -->
				<!-- as this limit is specific to datastore collections. -->
				{#if typeDatastore}
					<div>
						<Value>
							{#snippet label()}
								<!-- Internationalized label for the input field. -->
								{$i18n.collections.max_docs_per_user}
							{/snippet}
							<Input
								inputType="number"
								placeholder={$i18n.collections.max_docs_per_user_placeholder}
								name="maxDocsPerUser"
								required={false}
								bind:value={maxDocsPerUser}
								// When the input loses focus (onblur), ensure the value is an integer.
								// If the input is empty or invalid, nonNullish helps reset it to undefined.
								// Math.trunc is used to remove any decimal part.
								onblur={() =>
									(maxDocsPerUser = nonNullish(maxDocsPerUser)
										? Math.trunc(maxDocsPerUser)
										: undefined)}
							/>
						</Value>
					</div>
				{/if}

				<!-- Checkbox to allow controllers to bypass the max_docs_per_user limit. -->
				<!-- Also only shown for datastore collections as it's related to max_docs_per_user. -->
				{#if typeDatastore}
					<Checkbox>
						<label class="bypass">
							<input type="checkbox" bind:checked={controllerBypassMaxDocs} />
							<span>{$i18n.collections.controller_bypass_max_docs_label}</span>
						</label>
					</Checkbox>
				{/if}

				{#if typeDatastore}
					<div>
						<Value>
							{#snippet label()}
								{$i18n.collections.max_capacity}
							{/snippet}
							<Input
								inputType="number"
								placeholder={$i18n.collections.max_capacity_placeholder}
								name="maxCapacity"
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
			</div>
		</Collapsible>

		<div class="toolbar">
			<button type="button" onclick={oncancel}>{$i18n.core.cancel}</button>

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

	form,
	.options {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}

	form {
		padding: var(--padding-2x) var(--padding);
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
