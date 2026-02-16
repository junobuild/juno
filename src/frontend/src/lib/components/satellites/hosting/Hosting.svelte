<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import AddCustomDomain from '$lib/components/satellites/hosting/AddCustomDomain.svelte';
	import CustomDomain from '$lib/components/satellites/hosting/CustomDomain.svelte';
	import CustomDomainInfo, {
		type SelectedCustomDomain
	} from '$lib/components/satellites/hosting/CustomDomainInfo.svelte';
	import HostingCount from '$lib/components/satellites/hosting/HostingCount.svelte';
	import { sortedSatelliteCustomDomains } from '$lib/derived/satellite/satellite-custom-domains.derived';
	import { listCustomDomains } from '$lib/services/satellite/hosting/custom-domain.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import { satelliteUrl } from '$lib/utils/satellite.utils';
	import { satelliteAuthConfig } from '$lib/derived/satellite/satellite-configs.derived';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id.toText());

	const list = async () => {
		await listCustomDomains({
			satelliteId: satellite.satellite_id,
			reload: true
		});
	};

	onMount(list);

	let selectedInfo = $state<SelectedCustomDomain | undefined>();

	const onDisplayInfo = ({ detail }: CustomEvent<SelectedCustomDomain>) => (selectedInfo = detail);
</script>

<svelte:window onjunoSyncCustomDomains={list} />

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools"></th>
				<th class="domain"> {$i18n.hosting.domain} </th>
				<th class="auth"> {$i18n.core.sign_in}</th>
				<th> {$i18n.hosting.status}</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<CustomDomain ariaLabel={$i18n.hosting.default_domain} url={satelliteUrl(satelliteId)} />
			</tr>

			{#each $sortedSatelliteCustomDomains as [customDomainUrl, customDomain] (customDomainUrl)}
				<tr>
					<CustomDomain
						ariaLabel={$i18n.hosting.custom_domain}
						config={$satelliteAuthConfig}
						customDomain={[customDomainUrl, customDomain]}
						{satellite}
						type="custom"
						url={`https://${customDomainUrl}`}
						on:junoDisplayInfo={onDisplayInfo}
					/>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="footer">
	<AddCustomDomain config={$satelliteAuthConfig} {satellite} />

	<HostingCount {satellite} />
</div>

{#if nonNullish(selectedInfo)}
	<CustomDomainInfo info={selectedInfo} on:junoClose={() => (selectedInfo = undefined)} />
{/if}

<style lang="scss">
	@use '../../../styles/mixins/media';

	.tools {
		width: 105px;
	}

	.domain {
		@include media.min-width(small) {
			width: 50%;
		}
	}

	.auth {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
			width: 20%;
		}
	}

	.footer {
		display: flex;
		flex-direction: column-reverse;
		gap: var(--padding);

		@include media.min-width(small) {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}
	}
</style>
