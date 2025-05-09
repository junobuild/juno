<script lang="ts">
	import { isEmptyString, isNullish, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import ProgressHosting from '$lib/components/canister/ProgressHosting.svelte';
	import AddCustomDomainAuth from '$lib/components/hosting/AddCustomDomainAuth.svelte';
	import AddCustomDomainDns from '$lib/components/hosting/AddCustomDomainDns.svelte';
	import AddCustomDomainForm from '$lib/components/hosting/AddCustomDomainForm.svelte';
	import IconVerified from '$lib/components/icons/IconVerified.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { configHosting } from '$lib/services/hosting.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import type { JunoModalCustomDomainDetail, JunoModalDetail } from '$lib/types/modal';
	import type { HostingProgress } from '$lib/types/progress-hosting';
	import type { Option } from '$lib/types/utils';
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

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
		onFormNext();
		edit = true;
	});

	let editConfig = $state<Option<AuthenticationConfig>>();
	const onAuth = (detail: AuthenticationConfig | null) => {
		editConfig = detail;

		step = 'dns';
	};

	let progress: HostingProgress | undefined = $state(undefined);
	const onProgress = (hostingProgress: HostingProgress | undefined) => (progress = hostingProgress);

	const setupCustomDomain = async () => {
		if (isNullish(dns)) {
			toasts.error({
				text: $i18n.errors.hosting_missing_dns_configuration
			});
			return;
		}

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await configHosting({
			satelliteId: satellite.satellite_id,
			domainName: dns.hostname,
			editConfig,
			identity: $authStore.identity,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = edit ? 'dns' : 'init';
			return;
		}

		step = 'ready';
	};

	const close = () => {
		emit({ message: 'junoSyncCustomDomains' });
		onclose();
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
			on:junoClose={close}
		/>
	{:else if step === 'in_progress'}
		<ProgressHosting {progress} withConfig={nonNullish(editConfig)} />
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
