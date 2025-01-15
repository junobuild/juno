<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getCredits } from '$lib/api/console.api';
	import AppLangSelect from '$lib/components/core/AppLangSelect.svelte';
	import IdentityGuard from '$lib/components/guards/IdentityGuard.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Theme from '$lib/components/ui/Theme.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { authRemainingTimeStore, authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Languages } from '$lib/types/languages';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import { formatCredits } from '$lib/utils/icp.utils';

	let lang: Languages = $state('en');

	let remainingTimeMilliseconds: number | undefined = $derived($authRemainingTimeStore);

	let credits: bigint | undefined = $state(undefined);

	const loadCredits = async () => {
		if ($authSignedOut) {
			return;
		}

		try {
			credits = await getCredits($authStore.identity);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_credits,
				detail: err
			});
		}
	};

	onMount(loadCredits);
</script>

<IdentityGuard>
	<div class="card-container with-title">
		<span class="title">{$i18n.preferences.title}</span>

		<div class="columns-3 fit-column-1">
			<div>
				<div class="dev-id">
					<Value>
						{#snippet label()}
							{$i18n.preferences.dev_id}
						{/snippet}
						<Identifier identifier={$authStore.identity?.getPrincipal().toText() ?? ''} />
					</Value>
				</div>

				<Value>
					{#snippet label()}
						{$i18n.wallet.credits}
					{/snippet}
					<p>
						{#if nonNullish(credits)}<span in:fade>{formatCredits(credits)}</span>{/if}
					</p>
				</Value>

				<Value>
					{#snippet label()}
						{$i18n.preferences.session_expires_in}
					{/snippet}
					<p>
						{#if nonNullish(remainingTimeMilliseconds)}
							<output class="mr-1.5" in:fade>
								{remainingTimeMilliseconds <= 0
									? '0'
									: secondsToDuration(BigInt(remainingTimeMilliseconds) / 1000n)}
							</output>
						{/if}
					</p>
				</Value>
			</div>

			<div>
				<AppLangSelect bind:selected={lang} />

				<div class="theme">
					<Value>
						{#snippet label()}
							{$i18n.core.theme}
						{/snippet}

						<div>
							<Theme inline />
						</div>
					</Value>
				</div>
			</div>
		</div>
	</div>
</IdentityGuard>

<style lang="scss">
	.dev-id {
		margin: 0 0 var(--padding);
	}

	p {
		min-height: 24px;
	}

	.theme {
		margin: var(--padding) 0 0;

		div {
			padding: var(--padding) 0 0;
		}
	}
</style>
