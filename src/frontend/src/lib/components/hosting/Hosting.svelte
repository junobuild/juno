<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { satelliteUrl } from '$lib/utils/satellite.utils';
	import CustomDomain from '$lib/components/hosting/CustomDomain.svelte';
	import AddCustomDomain from '$lib/components/hosting/AddCustomDomain.svelte';
	import { onMount } from 'svelte';
	import { listCustomDomains } from '$lib/api/satellites.api';
	import { toasts } from '$lib/stores/toasts.store';

	export let satellite: Satellite;

	let satelliteId: string;
	$: satelliteId = satellite.satellite_id.toText();

	let customDomains: [string, CustomDomain][] = [];

	const list = async () => {
		try {
			customDomains = await listCustomDomains({
				satelliteId: satellite.satellite_id
			});
		} catch (err: unknown) {
			toasts.error({
				text: `Error while loading the custom domains of the satellite.`,
				detail: err
			});
		}
	};

	onMount(list);
</script>

<svelte:window on:junoSyncCustomDomains={list} />

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> Domain </th>
				<th> Status</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td colspan="2"
					><CustomDomain url={satelliteUrl(satelliteId)} alt="Default satellite domain" />
				</td>
			</tr>

			{#each customDomains as [customDomain, _]}
				<tr>
					<td colspan="2"
						><CustomDomain type="custom" url={`https://${customDomain}`} alt="A custom domain" />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<AddCustomDomain {satellite} />
