<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import AddCustomDomain from '$lib/components/hosting/AddCustomDomain.svelte';
	import CustomDomain from '$lib/components/hosting/CustomDomain.svelte';
	import CustomDomainInfo from '$lib/components/hosting/CustomDomainInfo.svelte';
	import HostingCount from '$lib/components/hosting/HostingCount.svelte';
	import { sortedSatelliteCustomDomains } from '$lib/derived/satellite-custom-domains.derived';
	import { getAuthConfig } from '$lib/services/auth/auth.config.services';
	import { listCustomDomains } from '$lib/services/custom-domain.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import type { SatelliteDid ,MissionControlDid } from '$lib/types/declarations';
	import type { Option } from '$lib/types/utils';
	import { satelliteUrl } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id.toText());

	let config = $state<SatelliteDid.AuthenticationConfig | undefined>();

	const list = async () => {
		const [_, { config: c }] = await Promise.all([
			listCustomDomains({
				satelliteId: satellite.satellite_id,
				reload: true
			}),
			getAuthConfig({
				satelliteId: satellite.satellite_id,
				identity: $authStore.identity
			})
		]);

		config = c;
	};

	onMount(list);

	interface SelectedCustomDomain {
		customDomain: [string, SatelliteDid.CustomDomain] | undefined;
		registrationState: Option<CustomDomainRegistrationState>;
		mainDomain: boolean;
	}

	let selectedInfo: SelectedCustomDomain | undefined = $state();

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
						{config}
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
	<AddCustomDomain {config} {satellite} />

	<HostingCount {satellite} />
</div>

{#if nonNullish(selectedInfo)}
	<CustomDomainInfo info={selectedInfo} on:junoClose={() => (selectedInfo = undefined)} />
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 100px;
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
