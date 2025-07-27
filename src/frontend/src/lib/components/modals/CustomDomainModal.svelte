<script lang="ts">
	import { fromNullishNullable, isEmptyString, isNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import ProgressHosting from '$lib/components/canister/ProgressHosting.svelte';
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
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { satellite, config } = $derived(detail as JunoModalCustomDomainDetail);

	let step: 'init' | 'dns' | 'in_progress' | 'ready' = $state('init');

	let domainNameInput = $state('');
	let dns = $state<CustomDomainDns | undefined>(undefined);
	let useDomainForDerivationOrigin = $state(false);

	let edit = $state(false);

	// The derivation origin is initialized by default with the first custom domain
	const initUseDomainForDerivationOrigin = () => {
		const authDomain = fromNullishNullable(
			fromNullishNullable(config?.internet_identity)?.derivation_origin
		);
		useDomainForDerivationOrigin = isEmptyString(authDomain);
	};

	onMount(() => {
		initUseDomainForDerivationOrigin();

		domainNameInput = (detail as JunoModalCustomDomainDetail).editDomainName ?? '';

		if (isEmptyString(domainNameInput)) {
			return;
		}

		dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		onNextDns();
		edit = true;
	});

	let progress: HostingProgress | undefined = $state(undefined);
	const onProgress = (hostingProgress: HostingProgress | undefined) => (progress = hostingProgress);

	const setupCustomDomain = async ($event: UIEvent) => {
		$event.preventDefault();

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
			config,
			useDomainForDerivationOrigin,
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

	const onNextDns = () => (step = 'dns');
</script>

<Modal onclose={close}>
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
			onsubmit={setupCustomDomain}
			onback={() => (step = 'init')}
			onclose={close}
		/>
	{:else if step === 'in_progress'}
		<ProgressHosting {progress} withConfig={useDomainForDerivationOrigin} />
	{:else}
		<AddCustomDomainForm
			bind:domainNameInput
			bind:dns
			bind:useDomainForDerivationOrigin
			{config}
			{satellite}
			onnext={onNextDns}
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
