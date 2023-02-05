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
	import { isNullish, nonNullish } from '$lib/utils/utils';

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
		<label for="collection">
			{#if mode === 'new'}
				Add collection:
			{:else}
				Edit collection:
			{/if}
		</label>

		<input
			id="collection"
			type="text"
			placeholder="A collection key"
			name="collection"
			bind:value={collection}
		/>

		<label for="read">Read permission:</label>
		<select id="read" name="read" bind:value={read}>
			<option value="Public">Public</option>
			<option value="Private">Private</option>
			<option value="Managed">Managed</option>
			<option value="Controllers">Controllers</option>
		</select>

		<label for="write">Write permission:</label>
		<select id="write" name="write" bind:value={write}>
			<option value="Public">Public</option>
			<option value="Private">Private</option>
			<option value="Managed">Managed</option>
			<option value="Controllers">Controllers</option>
		</select>

		{#if typeStorage}
			<label>Max size validation:</label>
			<Input
				inputType="number"
				placeholder="Max size in bytes"
				name="maxLength"
				required={false}
				bind:value={maxSize}
				on:blur={() => (maxSize = nonNullish(maxSize) ? Math.trunc(maxSize) : undefined)}
			/>
		{/if}

		<div class="toolbar">
			<button type="button" on:click={() => dispatch('junoCollectionCancel')}>Cancel</button>
			<button type="submit" class="primary">Submit</button>
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
	}

	label {
		padding: var(--padding-2x) 0 var(--padding);
	}

	.toolbar {
		display: flex;
		margin: var(--padding-2x) 0 0;
		gap: var(--padding-2x);
	}
</style>
