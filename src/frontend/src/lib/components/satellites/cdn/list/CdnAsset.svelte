<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { SatelliteDid } from '$declarations';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import type { Satellite } from '$lib/types/satellite';
	import { formatToDate } from '$lib/utils/date.utils';
	import CdnActions from '$lib/components/satellites/cdn/list/CdnActions.svelte';

	interface Props {
		asset: SatelliteDid.AssetNoContent;
		satellite: Satellite;
		reload: () => void;
	}

	let { asset, satellite, reload }: Props = $props();

	let { key, created_at, updated_at } = $derived(asset);
	let { full_path, description } = $derived(key);
</script>

<tr>
	<td class="actions">
		<CdnActions {asset} {satellite} {reload} />
	</td>
	<td><Identifier identifier={full_path} shortenLength={15} small={false} /></td>
	<td class="description">
		{description ?? ''}
	</td>
	<td class="created">{nonNullish(created_at) ? formatToDate(created_at) : ''}</td>
	<td class="updated">{nonNullish(updated_at) ? formatToDate(updated_at) : ''}</td>
</tr>

<style lang="scss">
	@use '../../../../styles/mixins/media';

	.description {
		vertical-align: middle;
	}

	.description {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}

	.created {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}

	.updated {
		display: none;

		@include media.min-width(large) {
			display: table-cell;
		}
	}
</style>
