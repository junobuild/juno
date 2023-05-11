<script lang="ts">
	import type { PermissionText } from '$lib/constants/rules.constants';
	import { setRule } from '$lib/api/satellites.api';
	import type { Rule, RulesType } from '$declarations/satellite/satellite.did';
	import { createEventDispatcher, getContext } from 'svelte';
	import { busy } from '$lib/stores/busy.store';
	import { permissionToText } from '$lib/utils/rules.utils';
	import { PermissionManaged } from '$lib/constants/rules.constants';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { toasts } from '$lib/stores/toasts.store';
	import { fromNullable } from '$lib/utils/did.utils';
	import Input from '$lib/components/ui/Input.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';

	const { store, reload }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	export let type: RulesType;

	let typeStorage = false;
	$: typeStorage = 'Storage' in type;

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

	let maxSize: number | undefined;
	const initMaxLength = (size: [] | [bigint]) => {
		const tmp = fromNullable(size);
		maxSize = nonNullish(tmp) ? Number(tmp) : undefined;
	};
	$: initMaxLength(rule?.max_size ?? []);

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
				type,
				rule,
				maxSize
			});

			await reload();

			toasts.success(`Rules ${rule !== undefined ? 'added' : 'updated'}.`);

			dispatch('junoCollectionSuccess');
		} catch (err: unknown) {
			toasts.error({
				text: `Error while ${rule !== undefined ? 'adding' : 'updating'} the rule.`,
				detail: err
			});
		}

		busy.stop();
	};
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
				/>
			</Value>
		</div>

		<div>
			<Value ref="read">
				<svelte:fragment slot="label">{$i18n.collections.read_permission}</svelte:fragment>
				<select id="read" name="read" bind:value={read}>
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
				<select id="write" name="write" bind:value={write}>
					<option value="Public">{$i18n.collections.public}</option>
					<option value="Private">{$i18n.collections.private}</option>
					<option value="Managed">{$i18n.collections.managed}</option>
					<option value="Controllers">{$i18n.collections.controllers}</option>
				</select>
			</Value>
		</div>

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

		<div class="toolbar">
			<button type="button" on:click={() => dispatch('junoCollectionCancel')}
				>{$i18n.core.cancel}</button
			>
			<button type="submit" class="primary">{$i18n.core.submit}</button>
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

	label {
		padding: var(--padding-2x) 0 0;
	}

	.toolbar {
		display: flex;
		margin: var(--padding-2x) 0 0;
		gap: var(--padding-2x);
	}
</style>
