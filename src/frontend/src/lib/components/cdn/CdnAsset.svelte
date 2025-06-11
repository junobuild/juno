<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { formatToDate } from '$lib/utils/date.utils';

	interface Props {
		asset: AssetNoContent;
		satelliteId: Principal;
	}

	let { asset, satelliteId: _ }: Props = $props();

	let { key, created_at, updated_at } = $derived(asset);
	let { full_path, description } = $derived(key);
</script>

<tr>
	<td class="actions"> </td>
	<td><Identifier small={false} shortenLength={15} identifier={full_path} /></td>
	<td class="description">
		{description ?? ''}
	</td>
	<td class="created">{nonNullish(created_at) ? formatToDate(created_at) : ''}</td>
	<td class="updated">{nonNullish(updated_at) ? formatToDate(updated_at) : ''}</td>
</tr>

<style lang="scss">
	@use '../../styles/mixins/media';

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
