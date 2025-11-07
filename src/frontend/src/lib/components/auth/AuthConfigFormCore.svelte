<script lang="ts">
	import { fromNullishNullable, nonNullish, notEmptyString } from '@dfinity/utils';
	import { PrincipalTextSchema } from '@dfinity/zod-schemas';
	import { Principal } from '@icp-sdk/core/principal';
	import type { SatelliteDid } from '$declarations';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		config: SatelliteDid.AuthenticationConfig | undefined;
		rule: SatelliteDid.Rule | undefined;
		maxTokens: number | undefined;
		allowedCallers: Principal[];
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let {
		onsubmit,
		config,
		rule,
		maxTokens = $bindable(undefined),
		allowedCallers = $bindable([])
	}: Props = $props();

	let maxTokensInput = $state<number | undefined>(
		nonNullish(fromNullishNullable(rule?.rate_config)?.max_tokens)
			? Number(fromNullishNullable(rule?.rate_config)?.max_tokens ?? 0)
			: undefined
	);

	$effect(() => {
		maxTokens = maxTokensInput;
	});

	let allowedCallersInput = $state<string>(
		(fromNullishNullable(config?.rules)?.allowed_callers ?? [])
			.map((caller) => caller.toText())
			.join('\n')
	);

	$effect(() => {
		allowedCallers = allowedCallersInput
			.split(/[\n,]+/)
			.map((input) => input.toLowerCase().trim())
			.filter(notEmptyString)
			.filter((input) => PrincipalTextSchema.safeParse(input).success)
			.map((input) => Principal.fromText(input));
	});
</script>

<h2>{$i18n.core.config}</h2>

<p>{$i18n.authentication.edit_configuration}</p>

<form class="content" {onsubmit}>
	<div class="container">
		{#if nonNullish(rule)}
			<div>
				<Value>
					{#snippet label()}
						{$i18n.collections.rate_limit}
					{/snippet}

					<Input
						name="maxTokens"
						inputType="number"
						onblur={() =>
							(maxTokensInput = nonNullish(maxTokensInput)
								? Math.trunc(maxTokensInput)
								: undefined)}
						placeholder={$i18n.collections.rate_limit_placeholder}
						required={false}
						bind:value={maxTokensInput}
					/>
				</Value>
			</div>
		{/if}

		<div>
			<Value>
				{#snippet label()}
					{$i18n.authentication.allowed_callers}
				{/snippet}

				<textarea
					placeholder={$i18n.authentication.allowed_callers_placeholder}
					rows="5"
					bind:value={allowedCallersInput}
				></textarea>
			</Value>
		</div>
	</div>

	<button disabled={$isBusy} type="submit">
		{$i18n.core.submit}
	</button>
</form>
