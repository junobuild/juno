<script lang="ts">
	import type { JunoModalCustomDomainDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import IconVerified from '$lib/components/icons/IconVerified.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { emit } from '$lib/utils/events.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { setCustomDomain } from '$lib/services/hosting.services';
	import { wizardBusy } from '$lib/stores/busy.store';
	import AddCustomDomainForm from '$lib/components/hosting/AddCustomDomainForm.svelte';
	import AddCustomDomainAuth from '$lib/components/hosting/AddCustomDomainAuth.svelte';
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import AddCustomDomainDns from '$lib/components/hosting/AddCustomDomainDns.svelte';
	import { setAuthConfig } from '$lib/api/satellites.api';
	import { authStore } from '$lib/stores/auth.store';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let config: AuthenticationConfig | undefined;
	$: ({ satellite, config } = detail as JunoModalCustomDomainDetail);

	let steps: 'init' | 'auth' | 'dns' | 'in_progress' | 'ready' = 'init';
	let domainNameInput = '';
	let dns: CustomDomainDns | undefined = undefined;

	let edit = false;

	onMount(() => {
		domainNameInput = (detail as JunoModalCustomDomainDetail).editDomainName ?? '';

		if (!notEmptyString(domainNameInput)) {
			return;
		}

		dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		steps = 'auth';
		edit = true;
	});

	let editConfig: AuthenticationConfig | undefined;
	const onAuth = ({ detail }: CustomEvent<AuthenticationConfig | undefined>) => {
		editConfig = detail;

		steps = 'dns';
	};

	const setupCustomDomain = async () => {
		if (isNullish(dns)) {
			toasts.error({
				text: $i18n.errors.hosting_missing_dns_configuration
			});
			return;
		}

		wizardBusy.start();
		steps = 'in_progress';

		try {
			await setCustomDomain({
				satelliteId: satellite.satellite_id,
				domainName: dns.hostname
			});

			if (nonNullish(editConfig)) {
				await setAuthConfig({
					satelliteId: satellite.satellite_id,
					config: editConfig,
					identity: $authStore.identity
				});
			}

			steps = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_configuration_issues,
				detail: err
			});

			steps = edit ? 'dns' : 'init';
		}

		wizardBusy.stop();
	};

	const dispatch = createEventDispatcher();
	const close = () => {
		emit({ message: 'junoSyncCustomDomains' });
		dispatch('junoClose');
	};
</script>

<Modal on:junoClose={close}>
	{#if steps === 'ready'}
		<div class="msg">
			<IconVerified />
			<p>{$i18n.hosting.success}</p>
			<button on:click={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'dns'}
		<AddCustomDomainDns
			{domainNameInput}
			{dns}
			{edit}
			on:junoSubmit={async () => await setupCustomDomain()}
			on:junoBack={() => (steps = 'init')}
			on:junoClose
		/>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.hosting.config_in_progress}</p>
		</SpinnerModal>
	{:else if steps === 'auth'}
		<AddCustomDomainAuth {domainNameInput} {config} on:junoNext={onAuth} />
	{:else}
		<AddCustomDomainForm
			bind:domainNameInput
			bind:dns
			{satellite}
			on:junoNext={() => (steps = 'auth')}
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
