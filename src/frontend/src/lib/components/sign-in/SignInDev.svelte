<script lang="ts">
	import { isEmptyString } from '@dfinity/utils';
	import {
		type DevIdentifier,
		type DevIdentifierData,
		loadDevIdentifiers
	} from '@junobuild/ic-client/dev';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import IconRobot from '$lib/components/icons/IconRobot.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { isDev } from '$lib/env/app.env';
	import { signInWithDev } from '$lib/services/console/auth/auth.dev.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { testId } from '$lib/utils/test.utils';

	let mode = $state<'continue' | 'switch'>('continue');

	const signIn = async (identifier?: DevIdentifier) => {
		await signInWithDev({ identifier });
	};

	let customIdentifier = $state('');

	const signInWithIdentifier = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isEmptyString(customIdentifier)) {
			toasts.error({
				text: $i18n.dev.enter_a_name
			});
			return;
		}

		await signInWithDev({ identifier: customIdentifier });
	};

	let identifiers = $state<[DevIdentifier, DevIdentifierData][]>([]);
	let lastDevIdentifier = $state<string | undefined>(undefined);

	let withRecentIdentifiers = $derived(identifiers.find(([key]) => key !== 'dev') !== undefined);

	const load = async () => {
		identifiers = await loadDevIdentifiers({
			limit: 10
		});

		lastDevIdentifier = identifiers[0]?.[0];
	};

	onMount(load);
</script>

{#if isDev()}
	{#if mode === 'switch'}
		<div in:fade>
			<form onsubmit={signInWithIdentifier}>
				<div class="identifier">
					<Value>
						{#snippet label()}
							{$i18n.dev.identifier}
						{/snippet}

						<Input
							name="dev_key"
							inputType="text"
							placeholder="e.g. yolo"
							required={false}
							testId={testIds.auth.inputDevIdentifier}
							bind:value={customIdentifier}
						/>
					</Value>
				</div>

				<button {...testId(testIds.auth.continueDevAccount)} disabled={$isBusy} type="submit"
					><span>{$i18n.core.continue}</span></button
				>
			</form>

			{#if withRecentIdentifiers}
				<p class="recent">{$i18n.dev.recent}:</p>

				<ul>
					{#each identifiers as identifier (identifier)}
						{@const [key] = identifier}

						<li>
							<button
								class="badge"
								aria-label={i18nFormat($i18n.dev.continue_with_dev, [
									{
										placeholder: '{0}',
										value: key
									}
								])}
								disabled={$isBusy}
								onclick={async () => await signIn(key)}><span>{key}</span></button
							>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{:else}
		<button
			{...testId(testIds.auth.signInDev)}
			disabled={$isBusy}
			onclick={async () => await signIn(lastDevIdentifier)}
			><IconRobot size="18px" />
			<span
				>{i18nFormat($i18n.dev.continue_with_dev, [
					{
						placeholder: '{0}',
						value: lastDevIdentifier ?? 'dev'
					}
				])}</span
			></button
		>

		<p class="switch">
			{$i18n.dev.or}
			<button
				{...testId(testIds.auth.switchDevAccount)}
				class="text"
				onclick={() => (mode = 'switch')}>{$i18n.dev.switch_account}</button
			>
		</p>
	{/if}
{/if}

<style lang="scss">
	button {
		width: 100%;
		padding: var(--padding) var(--padding-3x);
	}

	.switch {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--padding-0_5x);

		font-size: var(--font-size-very-small);
		margin: var(--padding-0_25x) 0 var(--padding-3x);
	}

	.text {
		width: fit-content;
		margin: 0;
	}

	.identifier {
		text-align: initial;

		:global(input) {
			margin: var(--padding-0_5x) 0;
		}
	}

	.recent {
		display: flex;
		justify-content: center;
		align-items: center;

		font-size: var(--font-size-very-small);
		margin: var(--padding-3x) 0 var(--padding);
	}

	ul {
		padding: var(--padding-0_25x) 0;
		margin: 0;
		list-style: none;

		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--padding);

		max-width: 300px;
	}

	form {
		display: flex;
		align-items: center;
		flex-direction: column;

		margin: 0 auto;
		max-width: 200px;
	}
</style>
