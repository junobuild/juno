<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import Popover from '$lib/components/ui/Popover.svelte';
	import type { CustomDomain as CustomDomainType } from '$declarations/satellite/satellite.did';
	import { createEventDispatcher } from 'svelte';
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';

	export let info: {
		customDomain: [string, CustomDomainType] | undefined;
		displayState: string | undefined | null;
		mainDomain: boolean;
	};

	let customDomain: [string, CustomDomainType] | undefined;
	let displayState: string | undefined | null;
	let mainDomain: boolean;

	$: ({ customDomain, displayState, mainDomain } = info);

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
	$: bnId = 'sdalkdsaklmasdlkmaslkmasldkmslakmlkdsm'; // fromNullable(customDomain?.[1].bn_id ?? []);

	$: visible, onVisible();
</script>

<Popover bind:visible center={true} backdrop="dark">
	<div class="content">
		<h3>{$i18n.hosting.custom_domain}</h3>

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

		{#if nonNullish(displayState)}
			<div class="space">
				<Value>
					<svelte:fragment slot="label">{$i18n.hosting.status}</svelte:fragment>
					<span class="capitalize">{displayState}</span>
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

	h3 {
		margin-bottom: var(--padding-2x);
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
