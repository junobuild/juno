<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import Popover from '$lib/components/ui/Popover.svelte';
	import type { CustomDomain as CustomDomainType } from '$declarations/satellite/satellite.did';
	import { createEventDispatcher } from 'svelte';
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import { fade } from 'svelte/transition';
	import { keyOf } from '$lib/utils/utils';

	export let info: {
		customDomain: [string, CustomDomainType] | undefined;
		registrationState: CustomDomainRegistrationState | null | undefined;
		mainDomain: boolean;
	};

	let customDomain: [string, CustomDomainType] | undefined;
	let registrationState: CustomDomainRegistrationState | null | undefined;
	let mainDomain: boolean;

	$: ({ customDomain, registrationState, mainDomain } = info);

	let visible = true;

	const dispatch = createEventDispatcher();
	const close = () => (visible = false);

	const onVisible = () => {
		if (visible) {
			return;
		}

		dispatch('junoClose');
	};

	let bnId: string | undefined;
	$: bnId = fromNullable(customDomain?.[1].bn_id ?? []);

	$: visible, onVisible();
</script>

<svelte:window
	on:junoRegistrationState={({ detail: { registrationState: state } }) =>
		(registrationState = state)}
/>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		{#if nonNullish(customDomain)}
			<div class="space">
				<Value>
					<svelte:fragment slot="label">{$i18n.hosting.domain}</svelte:fragment>
					{customDomain[0]}
				</Value>
			</div>

			{#if nonNullish(bnId)}
				<div>
					<Value>
						<svelte:fragment slot="label">{$i18n.hosting.bn_id}</svelte:fragment>
						<Identifier identifier={bnId} shorten={true} small={false} />
					</Value>
				</div>
			{/if}
		{/if}

		{#if mainDomain}
			<div class="space">
				<Value>
					<svelte:fragment slot="label">{$i18n.hosting.autentication_main_domain}</svelte:fragment>
					<span class="capitalize check"><IconCheckCircle /></span>
				</Value>
			</div>
		{/if}

		{#if nonNullish(registrationState)}
			<div class="space" in:fade>
				<Value>
					<svelte:fragment slot="label">{$i18n.hosting.status}</svelte:fragment>
					<span class="capitalize"
						>{keyOf({ obj: $i18n.hosting, key: registrationState.toLowerCase() })}</span
					>
				</Value>
			</div>
		{/if}

		<button type="button" on:click|stopPropagation={close}>
			{$i18n.core.ok}
		</button>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}

	.space {
		margin-bottom: var(--padding-2x);
	}

	.capitalize {
		text-transform: capitalize;
	}

	.check {
		display: block;
		margin: var(--padding-0_5x) 0 0;
	}
</style>
