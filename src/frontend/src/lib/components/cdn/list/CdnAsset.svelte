<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconArrowCircleUp from '$lib/components/icons/IconArrowCircleUp.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteDid, MissionControlDid } from '$declarations';
	import { formatToDate } from '$lib/utils/date.utils';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		asset: SatelliteDid.AssetNoContent;
		satellite: MissionControlDid.Satellite;
	}

	let { asset, satellite }: Props = $props();

	let { key, created_at, updated_at } = $derived(asset);
	let { full_path, description } = $derived(key);

	const openUpgrade = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'upgrade_satellite_with_cdn',
				detail: { asset, satellite }
			}
		});
	};
</script>

<tr>
	<td class="actions">
		<button class="square" aria-label={$i18n.canisters.upgrade} onclick={openUpgrade}
			><IconArrowCircleUp size="20px" /></button
		>
	</td>
	<td><Identifier identifier={full_path} shortenLength={15} small={false} /></td>
	<td class="description">
		{description ?? ''}
	</td>
	<td class="created">{nonNullish(created_at) ? formatToDate(created_at) : ''}</td>
	<td class="updated">{nonNullish(updated_at) ? formatToDate(updated_at) : ''}</td>
</tr>

<style lang="scss">
	@use '../../../styles/mixins/media';

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
