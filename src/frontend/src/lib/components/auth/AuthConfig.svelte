<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { fade } from 'svelte/transition';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import { getRule, setRule } from '$lib/api/satellites.api';
	import Input from '$lib/components/ui/Input.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS } from '$lib/constants/data.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	let rule: Rule | undefined = $state<Rule | undefined>(undefined);

	let maxTokens: number | undefined = $state(undefined);
	let maxTokensEdit: number | undefined = $state(undefined);

	const COLLECTION_USER = '#user';
	const RULE_TYPE = { Db: null };

	const loadRule = async () => {
		try {
			const result = await getRule({
				satelliteId,
				collection: COLLECTION_USER,
				identity: $authStore.identity,
				type: RULE_TYPE
			});

			rule = fromNullable(result);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_settings,
				detail: err
			});
		}
	};

	let satVersion: string | undefined = $derived(
		$versionStore?.satellites[satelliteId.toText()]?.current
	);

	let supportSettings: boolean = $derived(compare(satVersion ?? '0.0.0', '0.0.21') >= 0);

	$effect(() => {
		if (!supportSettings) {
			return;
		}

		loadRule();
	});

	$effect(() => {
		const rateConfig = fromNullable(rule?.rate_config ?? []);
		maxTokens = nonNullish(rateConfig?.max_tokens) ? Number(rateConfig.max_tokens) : undefined;
		maxTokensEdit = maxTokens;
	});

	let visible = $state(false);

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

		if (isNullish(maxTokensEdit)) {
			toasts.error({ text: $i18n.errors.auth_rate_config_max_tokens });
			return;
		}

		busy.start();

		try {
			rule = await setRule({
				rule: {
					...rule,
					rate_config: [
						{
							time_per_token_ns: DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS,
							max_tokens: BigInt(maxTokensEdit)
						}
					]
				},
				type: RULE_TYPE,
				identity: $authStore.identity,
				collection: COLLECTION_USER,
				satelliteId
			});

			visible = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.auth_rate_config_update,
				detail: err
			});
		}

		busy.stop();
	};
</script>

{#if supportSettings}
	<div class="card-container with-title" in:fade>
		<span class="title">{$i18n.core.config}</span>

		<div class="columns-3 fit-column-1">
			<div>
				<Value>
					{#snippet label()}
						{$i18n.collections.rate_limit_placeholder}
					{/snippet}

					{#if isNullish(rule)}
						<p><SkeletonText /></p>
					{:else if isNullish(maxTokens)}
						<p>{$i18n.collections.no_rate_limit}</p>
					{:else}
						<p>{maxTokens}</p>
					{/if}
				</Value>
			</div>
		</div>
	</div>

	<button in:fade onclick={openModal}>{$i18n.core.edit_config}</button>
{/if}

<Popover bind:visible center backdrop="dark">
	<form class="container" onsubmit={handleSubmit}>
		<label for="maxTokens">{$i18n.collections.rate_limit}:</label>

		<Input
			inputType="number"
			placeholder={$i18n.collections.rate_limit_placeholder}
			name="maxTokens"
			required={true}
			disabled={$isBusy}
			bind:value={maxTokensEdit}
			on:blur={() =>
				(maxTokensEdit = nonNullish(maxTokensEdit) ? Math.trunc(maxTokensEdit) : undefined)}
		/>

		<button type="submit" class="submit" disabled={$isBusy}>
			{$i18n.core.configure}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.edit;

	button {
		margin: 0 0 var(--padding-8x);
	}
</style>
