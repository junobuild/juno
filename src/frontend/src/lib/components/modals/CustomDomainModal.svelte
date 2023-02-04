<script lang="ts">
	import type { JunoModalSatelliteDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import Copy from '$lib/components/ui/Copy.svelte';
	import type { CustomDomainDns } from '$lib/types/custom-domain';
	import { toCustomDomainDns } from '$lib/utils/custom-domain.utils';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import IconVerified from '$lib/components/icons/IconVerified.svelte';
	import { createEventDispatcher } from 'svelte';
	import { setCustomDomain } from '$lib/api/satellites.api';
	import { emit } from '$lib/utils/events.utils';

	export let detail: JunoModalSatelliteDetail;

	let satellite: Satellite;
	$: ({ satellite } = detail);

	let steps: 'init' | 'dns' | 'in_progress' | 'ready' | 'error' = 'init';

	const onSubmitDomainName = () => {
		if (isNullish(domainNameInput)) {
			toasts.error({
				text: `A domain name must be provided.`
			});
			return;
		}

		try {
			dns = toCustomDomainDns({ domainName: domainNameInput, canisterId: satellite.satellite_id });
		} catch (err: unknown) {
			toasts.error({
				text: `Please provide a valid URL.`
			});
			return;
		}

		steps = 'dns';
	};

	const setupCustomDomain = async () => {
		if (isNullish(dns)) {
			toasts.error({
				text: `A domain name configuration must be provided.`
			});
			return;
		}

		steps = 'in_progress';

		try {
			await setCustomDomain({
				satelliteId: satellite.satellite_id,
				domainName: dns.hostname,
				boundaryNodesId: '123'
			});

			steps = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: `Error while configuring the custom domain for the satellite.`,
				detail: err
			});

			steps = 'error';
		}
	};

	let domainNameInput: string | undefined = undefined;
	let dns: CustomDomainDns | undefined = undefined;

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
			<p>Your custom domain has been configured.</p>
			<button on:click={close}>Close</button>
		</div>
	{:else if steps === 'dns'}
		<h2>Configure your DNS</h2>

		<p>
			Add records below to your DNS provider to configure and verify you own {domainNameInput}. Do
			not delete any records as long as you use the domain.
		</p>

		<section>
			<p class="title">Type</p>
			<p class="title">Host</p>
			<p class="title value">Value</p>

			{#each dns.entries ?? [] as { type, host, value }}
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

		<div class="toolbar">
			<button on:click={() => (steps = 'init')}>Back</button>
			<button on:click={setupCustomDomain}>Ready</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>Configuration in progress...</p>
		</SpinnerModal>
	{:else}
		<h2>Add custom domain</h2>

		<p>
			Enter the exact domain name you want people to see when they visit your satellite. It can be a
			domain (yourdomain.com) or a subdomain (app.yourdomain.com).
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
</style>
