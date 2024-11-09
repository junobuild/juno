<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import type { RateConfig, Rule } from '$declarations/satellite/satellite.did';
	import { getRule } from '$lib/api/satellites.api';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { busy } from '$lib/stores/busy.store';
	import Input from "$lib/components/ui/Input.svelte";

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	let rule: Rule | undefined = $state<Rule | undefined>(undefined);

	let maxTokens: number | undefined = $state(undefined);

	const loadRule = async () => {
		try {
			const result = await getRule({
				satelliteId,
				collection: '#user',
				identity: $authStore.identity,
				type: { Db: null }
			});

			rule = fromNullable(result);

			const rateConfig = fromNullable(rule?.rate_config ?? []);
			maxTokens = nonNullish(rateConfig?.max_tokens) ? Number(rateConfig.max_tokens) : undefined;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_settings,
				detail: err
			});
		}
	};

	$effect(() => {
		loadRule();
	});

	let visible = $state(false);
	let saving = $state(false);

	const openModal = () => {
		if (isNullish(rule)) {
			toasts.error({ text: $i18n.errors.auth_settings_no_loaded });
			return;
		}

		visible = true;
	};

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish(rule)) {
			toasts.error({ text: $i18n.errors.auth_settings_no_loaded });
			return;
		}

		busy.start();

		try {
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.satellite_name_update,
				detail: err
			});
		}

		busy.stop();
	};
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.settings}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.collections.rate_limit_placeholder}
				{/snippet}

				{#if isNullish(rule)}
					<p><SkeletonText /></p>
				{:else if isNullish(maxTokens)}
					<p>&ZeroWidthSpace;</p>
				{:else}
					<p>{maxTokens}</p>
				{/if}
			</Value>
		</div>
	</div>
</div>

<button onclick={openModal}>{$i18n.canisters.edit_settings}</button>

<Popover bind:visible center backdrop="dark">
	<form class="container" onsubmit={handleSubmit}>
		<label for="maxTokens">{$i18n.collections.rate_limit}:</label>

		<Input
				inputType="number"
				placeholder={$i18n.collections.rate_limit_placeholder}
				name="maxTokens"
				required={false}
				bind:value={maxTokens}
				on:blur={() => (maxTokens = nonNullish(maxTokens) ? Math.trunc(maxTokens) : undefined)}
		/>

		<button type="submit" class="submit" disabled={saving}>
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	button {
		margin: 0 0 var(--padding-8x);
	}

	p {
		height: 24px;
	}
</style>
