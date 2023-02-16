<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { satelliteUrl } from '$lib/utils/satellite.utils';
	import CustomDomain from '$lib/components/hosting/CustomDomain.svelte';
	import AddCustomDomain from '$lib/components/hosting/AddCustomDomain.svelte';
	import { onMount } from 'svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CustomDomain as CustomDomainType } from '$declarations/satellite/satellite.did';
	import { i18n } from '$lib/stores/i18n.store';
	import { listCustomDomains } from '$lib/services/hosting.services';

	export let satellite: Satellite;

	let satelliteId: string;
	$: satelliteId = satellite.satellite_id.toText();

	let customDomains: [string, CustomDomainType][] = [];

	const list = async () => {
		try {
			customDomains = await listCustomDomains({
				satelliteId: satellite.satellite_id
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_loading_errors,
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
				<th class="domain"> {$i18n.hosting.domain} </th>
				<th> {$i18n.hosting.status}</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<CustomDomain url={satelliteUrl(satelliteId)} ariaLabel={$i18n.hosting.default_domain} />
			</tr>

			{#each customDomains as [customDomainUrl, customDomain]}
				<tr>
					<CustomDomain
						type="custom"
						url={`https://${customDomainUrl}`}
						{customDomain}
						ariaLabel={$i18n.hosting.custom_domain}
					/>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<AddCustomDomain {satellite} />

<style lang="scss">
	@use '../../styles/mixins/media';

	.domain {
		width: 80%;

		@include media.min-width(large) {
			width: 60%;
		}
	}
</style>
