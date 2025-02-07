<script lang="ts">
	import { isEmptyString, isNullish, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import { setAuthConfig } from '$lib/api/satellites.api';
	import AddCustomDomainAuth from '$lib/components/hosting/AddCustomDomainAuth.svelte';
	import AddCustomDomainDns from '$lib/components/hosting/AddCustomDomainDns.svelte';
	import AddCustomDomainForm from '$lib/components/hosting/AddCustomDomainForm.svelte';
	import IconVerified from '$lib/components/icons/IconVerified.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { setCustomDomain } from '$lib/services/custom-domain.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import type { JunoModalCustomDomainDetail, JunoModalDetail } from '$lib/types/modal';
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let { satellite, config } = $derived(detail as JunoModalCustomDomainDetail);

	let step: 'init' | 'auth' | 'dns' | 'in_progress' | 'ready' = $state('init');
	let domainNameInput = $state('');
	let dns: CustomDomainDns | undefined = $state(undefined);

	let edit = $state(false);

	onMount(() => {
		domainNameInput = (detail as JunoModalCustomDomainDetail).editDomainName ?? '';

		if (isEmptyString(domainNameInput)) {
			return;
		}

		dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		step = 'auth';
		edit = true;
	});

	let editConfig: AuthenticationConfig | null;
	const onAuth = (detail: AuthenticationConfig | null) => {
		editConfig = detail;

		step = 'dns';
	};

	const setupCustomDomain = async () => {
		if (isNullish(dns)) {
			toasts.error({
				text: $i18n.errors.hosting_missing_dns_configuration
			});
			return;
		}

		wizardBusy.start();
		step = 'in_progress';

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

			step = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_configuration_issues,
				detail: err
			});

			step = edit ? 'dns' : 'init';
		}

		wizardBusy.stop();
	};

	const dispatch = createEventDispatcher();
	const close = () => {
		emit({ message: 'junoSyncCustomDomains' });
		dispatch('junoClose');
	};

	const onFormNext = () => {
		let authDomain: string | undefined = fromNullishNullable(
			fromNullishNullable(config?.internet_identity)?.derivation_origin
		);

		let existingDerivationOrigin = nonNullish(authDomain);

		step = existingDerivationOrigin ? 'dns' : 'auth';
	};
</script>

<Modal on:junoClose={close}>
	{#if step === 'ready'}
		<div class="msg">
			<IconVerified />
			<p>{$i18n.hosting.success}</p>
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'dns'}
		<AddCustomDomainDns
			{domainNameInput}
			{dns}
			{edit}
			on:junoSubmit={async () => await setupCustomDomain()}
			on:junoBack={() => (step = 'init')}
			on:junoClose
		/>
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.hosting.config_in_progress}</p>
		</SpinnerModal>
	{:else if step === 'auth'}
		<AddCustomDomainAuth {domainNameInput} {config} next={onAuth} />
	{:else}
		<AddCustomDomainForm bind:domainNameInput bind:dns {satellite} on:junoNext={onFormNext} />
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
