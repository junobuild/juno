<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type {
		AuthenticationConfig,
		CustomDomain as CustomDomainType
	} from '$declarations/satellite/satellite.did';
	import AddCustomDomain from '$lib/components/hosting/AddCustomDomain.svelte';
	import CustomDomain from '$lib/components/hosting/CustomDomain.svelte';
	import CustomDomainInfo from '$lib/components/hosting/CustomDomainInfo.svelte';
	import HostingCount from '$lib/components/hosting/HostingCount.svelte';
	import { sortedSatelliteCustomDomains } from '$lib/derived/satellite-custom-domains.derived';
	import { listCustomDomains, getAuthConfig } from '$lib/services/hosting.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import type { Option } from '$lib/types/utils';
	import { satelliteUrl } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId: SatelliteIdText = $derived(satellite.satellite_id.toText());

	let config: AuthenticationConfig | undefined = $state();

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
		customDomain: [string, CustomDomainType] | undefined;
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
				<CustomDomain url={satelliteUrl(satelliteId)} ariaLabel={$i18n.hosting.default_domain} />
			</tr>

			{#each $sortedSatelliteCustomDomains as [customDomainUrl, customDomain]}
				<tr>
					<CustomDomain
						type="custom"
						url={`https://${customDomainUrl}`}
						customDomain={[customDomainUrl, customDomain]}
						{config}
						ariaLabel={$i18n.hosting.custom_domain}
						{satellite}
						on:junoDisplayInfo={onDisplayInfo}
					/>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="footer">
	<AddCustomDomain {satellite} {config} />

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
