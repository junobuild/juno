<script lang="ts">
	import type { JunoModalCustomDomainDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import Copy from '$lib/components/ui/Copy.svelte';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import IconVerified from '$lib/components/icons/IconVerified.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { emit } from '$lib/utils/events.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { setCustomDomain } from '$lib/services/hosting.services';
	import { wizardBusy } from '$lib/stores/busy.store';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	$: ({ satellite } = detail as JunoModalCustomDomainDetail);

	let steps: 'init' | 'dns' | 'in_progress' | 'ready' = 'init';
	let domainNameInput: string | undefined = undefined;
	let dns: CustomDomainDns | undefined = undefined;

	let edit = false;

	onMount(() => {
		domainNameInput = (detail as JunoModalCustomDomainDetail).editDomainName;

		if (isNullish(domainNameInput)) {
			return;
		}

		dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		steps = 'dns';
		edit = true;
	});

	const onSubmitDomainName = () => {
		if (isNullish(domainNameInput)) {
			toasts.error({
				text: $i18n.errors.hosting_missing_domain_name
			});
			return;
		}

		try {
			dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_invalid_url
			});
			return;
		}

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
		<h2>{$i18n.hosting.configure}</h2>

		<p>
			{@html i18nFormat($i18n.hosting.add_records, [
				{
					placeholder: '{0}',
					value: domainNameInput
				}
			])}
		</p>

		<section>
			<p class="title">{$i18n.hosting.type}</p>
			<p class="title">{$i18n.hosting.host}</p>
			<p class="title value">{$i18n.hosting.value}</p>

			{#each dns?.entries ?? [] as { type, host, value }}
				<p class="td">{type}</p>
				<p class="td">
					{#if nonNullish(host)}
						<span>{host}</span>
						<Copy value={host} />
					{/if}
				</p>
				<p class="value td">
					<span>{value}</span>
					<Copy {value} />
				</p>
			{/each}
		</section>

		<p class="notes">{@html $i18n.hosting.dns_notes}</p>

		<div class="toolbar">
			{#if !edit}
				<button on:click={() => (steps = 'init')}>{$i18n.core.back}</button>
				<button on:click={setupCustomDomain}>{$i18n.core.ready}</button>
			{:else}
				<button on:click={() => dispatch('junoClose')}>{$i18n.core.close}</button>
				<button on:click={setupCustomDomain}>{$i18n.core.submit}</button>
			{/if}
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.hosting.config_in_progress}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.hosting.add_custom_domain}</h2>

		<p>
			{$i18n.hosting.description}
		</p>

		<form on:submit|preventDefault={onSubmitDomainName}>
			<input
				bind:value={domainNameInput}
				type="text"
				name="domain_name"
				placeholder="Domain name"
			/>

			<button type="submit">Continue</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/collections';
	@use '../../styles/mixins/shadow';
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	section {
		display: grid;
		grid-template-columns: repeat(4, auto);

		@include shadow.shadow;

		p {
			display: inline-flex;
			align-items: center;
			gap: var(--padding);
			margin: 0;
		}

		span {
			@include text.truncate;
		}
	}

	.title {
		@include collections.title-style;
	}

	.value {
		grid-column: span 2;
	}

	.toolbar {
		padding: var(--padding) 0 0 0;
	}

	.notes {
		margin: var(--padding-4x) 0 var(--padding-2x);
	}
</style>
