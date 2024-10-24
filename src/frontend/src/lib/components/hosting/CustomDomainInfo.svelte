<script lang="ts">
	import { run, stopPropagation } from 'svelte/legacy';

	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { CustomDomain as CustomDomainType } from '$declarations/satellite/satellite.did';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store.js';
	import type { CustomDomainRegistrationState } from '$lib/types/custom-domain';
	import type { Option } from '$lib/types/utils';
	import { keyOf } from '$lib/utils/utils';

	interface Props {
		info: {
			customDomain: [string, CustomDomainType] | undefined;
			registrationState: Option<CustomDomainRegistrationState>;
			mainDomain: boolean;
		};
	}

	let { info }: Props = $props();

	let customDomain: [string, CustomDomainType] | undefined = $state();
	let registrationState: Option<CustomDomainRegistrationState> = $state();
	let mainDomain: boolean = $state();

	run(() => {
		({ customDomain, registrationState, mainDomain } = info);
	});

	let visible = $state(true);

	const dispatch = createEventDispatcher();
	const close = () => (visible = false);

	const onVisible = () => {
		if (visible) {
			return;
		}

		dispatch('junoClose');
	};

	let bnId: string | undefined = $derived(fromNullable(customDomain?.[1].bn_id ?? []));

	run(() => {
		visible, onVisible();
	});
</script>

<svelte:window
	onjunoRegistrationState={({ detail: { registrationState: state } }) =>
		(registrationState = state)}
/>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		{#if nonNullish(customDomain)}
			<div class="space">
				<Value>
					{#snippet label()}
						{$i18n.hosting.domain}
					{/snippet}
					{customDomain[0]}
				</Value>
			</div>

			{#if nonNullish(bnId)}
				<div>
					<Value>
						{#snippet label()}
							{$i18n.hosting.bn_id}
						{/snippet}
						<Identifier identifier={bnId} shorten={true} small={false} />
					</Value>
				</div>
			{/if}
		{/if}

		{#if mainDomain}
			<div class="space">
				<Value>
					{#snippet label()}
						{$i18n.hosting.autentication_main_domain}
					{/snippet}
					<span class="capitalize check"><IconCheckCircle /></span>
				</Value>
			</div>
		{/if}

		{#if nonNullish(registrationState)}
			<div class="space" in:fade>
				<Value>
					{#snippet label()}
						{$i18n.hosting.status}
					{/snippet}
					<span class="capitalize"
						>{keyOf({ obj: $i18n.hosting, key: registrationState.toLowerCase() })}</span
					>
				</Value>
			</div>
		{/if}

		<button type="button" onclick={stopPropagation(close)}>
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
