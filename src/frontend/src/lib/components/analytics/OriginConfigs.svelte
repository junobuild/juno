<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import OriginConfigAdd from '$lib/components/analytics/OriginConfigAdd.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { onMount, setContext } from 'svelte';
	import { listOriginConfigs } from '$lib/api/orbiter.api';
	import type { OriginConfig } from '$declarations/orbiter/orbiter.did';
	import { writable } from 'svelte/store';
	import {
		ORIGINS_CONTEXT_KEY,
		type OriginsContext,
		type OriginsStoreData
	} from '$lib/types/origins.context';
	import { nonNullish } from '$lib/utils/utils';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';

	export let orbiterId: Principal;

	const store = writable<OriginsStoreData>(undefined);

	setContext<OriginsContext>(ORIGINS_CONTEXT_KEY, {
		store
	});

	const list = (): Promise<[Principal, OriginConfig][]> => listOriginConfigs({ orbiterId });

	const load = async () => {
		try {
			const origins = await list();
			store.set(origins);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.origins_listing,
				detail: err
			});
		}
	};

	onMount(async () => await load());

	let empty: boolean | undefined = undefined;
	$: empty = nonNullish($store) && $store.length === 0;

	let visibleDelete = false;
	let selectedFilter: [Principal, OriginConfig] | undefined;
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools" />
				<th class="origin"> {$i18n.satellites.satellite} </th>
				<th class="origin"> {$i18n.origins.filter} </th>
			</tr>
		</thead>
		<tbody>
			{#each $store ?? [] as [satelliteId, config] (satelliteId.toText())}
				<tr>
					<td class="actions">
						<ButtonTableAction
							icon="delete"
							ariaLabel={$i18n.origins.delete}
							on:click={() => {
								selectedFilter = [satelliteId, config];
								visibleDelete = true;
							}}
						/>
					</td>

					<td>
						<Identifier identifier={satelliteId.toText()} shorten={false} small={false} />
					</td>

					<td>{config.filter}</td>
				</tr>
			{/each}

			{#if empty}
				<tr>
					<td class="actions" />
					<td colspan="2">
						{$i18n.origins.empty}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<OriginConfigAdd {orbiterId} />

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 48px;
	}
</style>
