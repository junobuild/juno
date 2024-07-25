<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { satelliteUrl } from '$lib/utils/satellite.utils';
	import CustomDomain from '$lib/components/hosting/CustomDomain.svelte';
	import AddCustomDomain from '$lib/components/hosting/AddCustomDomain.svelte';
	import { onMount } from 'svelte';
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import { i18n } from '$lib/stores/i18n.store';
	import { listCustomDomains, getAuthConfig } from '$lib/services/hosting.services';
	import HostingCount from '$lib/components/hosting/HostingCount.svelte';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { authStore } from '$lib/stores/auth.store';
	import { satelliteCustomDomains } from '$lib/derived/custom-domains.derived';

	export let satellite: Satellite;

	let satelliteId: SatelliteIdText;
	$: satelliteId = satellite.satellite_id.toText();

	let config: AuthenticationConfig | undefined;

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

	let hasCustomDomains = false;
	$: hasCustomDomains = $satelliteCustomDomains.length > 0;
</script>

<svelte:window on:junoSyncCustomDomains={list} />

<div class="table-container">
	<table>
		<thead>
			<tr>
				{#if hasCustomDomains}
					<th class="tools" />
				{/if}
				<th class="domain"> {$i18n.hosting.domain} </th>
				<th class="auth"> {$i18n.core.sign_in}</th>
				<th> {$i18n.hosting.status}</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<CustomDomain
					url={satelliteUrl(satelliteId)}
					ariaLabel={$i18n.hosting.default_domain}
					toolsColumn={hasCustomDomains}
				/>
			</tr>

			{#each $satelliteCustomDomains as [customDomainUrl, customDomain]}
				<tr>
					<CustomDomain
						type="custom"
						url={`https://${customDomainUrl}`}
						customDomain={[customDomainUrl, customDomain]}
						{config}
						ariaLabel={$i18n.hosting.custom_domain}
						{satellite}
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
