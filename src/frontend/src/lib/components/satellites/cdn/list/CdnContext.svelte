<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { SatelliteDid } from '$declarations';
	import Cdn from '$lib/components/satellites/cdn/list/Cdn.svelte';
	import ListContext from '$lib/components/satellites/list/ListContext.svelte';
	import type { ListDocsFn } from '$lib/services/satellite/_list-docs.services';
	import { listWasmAssets } from '$lib/services/satellite/functions/cdn.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { ListParamsKey } from '$lib/types/list-params.context';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	const listFn: ListDocsFn<SatelliteDid.AssetNoContent> = listWasmAssets;

	let listContextRef = $state<ListContext<SatelliteDid.AssetNoContent> | undefined>();
	const reload = () => listContextRef?.reload();
</script>

<ListContext
	bind:this={listContextRef}
	errorLabel={$i18n.errors.load_cdn}
	{listFn}
	listKey={ListParamsKey.CDN}
	satelliteId={satellite.satellite_id}
>
	<Cdn {reload} {satellite} />
</ListContext>
