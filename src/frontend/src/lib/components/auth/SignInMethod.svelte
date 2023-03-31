<script lang="ts">
	import IconIC from '$lib/components/icons/IconIC.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import IconNFID from '$lib/components/icons/IconNFID.svelte';
	import {i18n} from "$lib/stores/i18n.store";
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
				<td
					><ExternalLink href="https://internetcomputer.org/internet-identity"
						><IconIC /> Internet Identity</ExternalLink
					></td
				>
				<td class="status">{$i18n.users.enabled}</td>
			</tr>

			<tr>
				<td><ExternalLink href="https://nfid.one/"><IconNFID /></ExternalLink></td>
				<td class="status">{$i18n.users.enabled}</td>
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
		}
	}

	tr:last-of-type td {
		padding-bottom: var(--padding-1_5x);
	}
</style>
