<script lang="ts">
	import IconIc from '$lib/components/icons/IconIC.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';
	import IconPasskey from '$lib/components/icons/IconPasskey.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>Provider</th>
				<th class="status">Status</th>
			</tr>
		</thead>

		<tbody>
			<tr>
				<td><span class="provider"><IconIc /> Internet Identity</span></td>
				<td class="status">{$i18n.core.enabled}</td>
			</tr>

			<tr>
				<td><span class="provider"><IconNFID /> NFID</span></td>
				<td class="status">{$i18n.core.enabled}</td>
			</tr>

			<tr>
				<td><span class="provider"><IconPasskey /> Passkey</span></td>
				<td class="status">{$i18n.core.enabled}</td>
			</tr>
		</tbody>
	</table>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.status {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
			vertical-align: middle;
		}
	}

	tr:first-of-type td {
		padding-top: var(--padding-1_5x);
	}

	tr:last-of-type td {
		padding-bottom: var(--padding-1_5x);
	}

	.provider {
		display: flex;
		align-items: center;
		gap: var(--padding-1_5x);
	}

	.table-container {
		margin: 0 0 var(--padding-8x);
	}
</style>
