<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import type { RateConfig, Rule } from '$declarations/satellite/satellite.did';
	import { getRule } from '$lib/api/satellites.api';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	let rule: Rule | undefined = $state<Rule | undefined>(undefined);

	const loadRule = async () => {
		try {
			const result = await getRule({
				satelliteId,
				collection: '#user',
				identity: $authStore.identity,
				type: { Db: null }
			});

			rule = fromNullable(result);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_settings,
				detail: err
			});
		}
	};

	let rateConfig: RateConfig | undefined = $derived(fromNullable(rule?.rate_config ?? []));

	let maxTokens: bigint | undefined = $derived(rateConfig?.max_tokens);

	$effect(() => {
		loadRule();
	});

	const openModal = () => {};
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.settings}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.collections.rate_limit_placeholder}
				{/snippet}

				{#if isNullish(maxTokens)}
					<p><SkeletonText /></p>
				{:else}
					<p>{maxTokens}</p>
				{/if}
			</Value>
		</div>
	</div>
</div>

<button onclick={openModal}>{$i18n.canisters.edit_settings}</button>

<style lang="scss">
	button {
		margin: 0 0 var(--padding-8x);
	}

	p {
		height: 24px;
	}
</style>
